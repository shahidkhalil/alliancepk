"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import {
  chatInsights,
  fetchInsights,
  generateBlogFromKeyword,
  type InsightsPayload,
  type InsightsQueryRow,
} from "@/lib/adminInsightsApi";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function AdminInsights({
  onBlogCreated,
}: {
  onBlogCreated?: (slug: string) => void;
}) {
  const [country, setCountry] = useState<"usa" | "all">("usa");
  const [data, setData] = useState<InsightsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyQuery, setBusyQuery] = useState<string | null>(null);
  const [genMsg, setGenMsg] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const topQueries = data?.gsc.queries || [];

  const contextForChat = useMemo(() => {
    if (!data) return null;
    return {
      country: data.country,
      dateRange: { start: data.gsc.startDate, end: data.gsc.endDate },
      topQueries: data.gsc.queries.slice(0, 25),
      topPages: data.pages?.slice(0, 10),
      analytics: data.analytics,
    };
  }, [data]);

  const load = async () => {
    setLoading(true);
    setError("");
    setGenMsg("");
    try {
      const payload = await fetchInsights({ country, days: 28 });
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  const ask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const question = chatInput.trim();
    if (!question || chatBusy) return;
    if (!contextForChat) {
      setError("Pull Search Console data first, then ask questions.");
      return;
    }
    setChatBusy(true);
    setError("");
    setChatInput("");
    const nextHistory = [...messages, { role: "user" as const, content: question }];
    setMessages(nextHistory);
    try {
      const res = await chatInsights({
        question,
        context: contextForChat,
        history: messages,
      });
      setMessages([...nextHistory, { role: "assistant", content: res.answer }]);
    } catch (err) {
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Chat failed",
        },
      ]);
    } finally {
      setChatBusy(false);
    }
  };

  const generate = async (row: InsightsQueryRow) => {
    setBusyQuery(row.query);
    setGenMsg("");
    setError("");
    try {
      const res = await generateBlogFromKeyword({
        query: row.query,
        gscMeta: row,
      });
      setGenMsg(`${res.title} — draft saved as /blog/${res.slug}`);
      onBlogCreated?.(res.slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blog generation failed");
    } finally {
      setBusyQuery(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
          {(
            [
              ["usa", "USA keywords"],
              ["all", "All countries"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCountry(id)}
              className={`px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${
                country === id
                  ? "bg-[#00283C] text-white"
                  : "text-gray-500 hover:text-[#00283C]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00283C] text-white text-sm font-bold hover:bg-[#003d5c] disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Pull Search Console & Analytics
        </button>
        {data && (
          <p className="text-xs text-gray-400">
            {data.gsc.startDate} → {data.gsc.endDate} · fetched{" "}
            {new Date(data.fetchedAt).toLocaleString()}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {genMsg && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {genMsg} Open <strong>Blog → Drafts</strong> to review and publish.
        </div>
      )}

      {!data && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          Pull live Search Console + Analytics data, then ask questions or generate blogs
          from keywords.
        </div>
      )}

      {data && (
        <>
          <section className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Opportunity keywords
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#00283C]">
                {topQueries.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                GA sessions
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#00283C]">
                {data.analytics?.totals?.sessions ?? "—"}
              </p>
              {data.analytics?.error && (
                <p className="text-[11px] text-amber-600 mt-1">Analytics unavailable</p>
              )}
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                GA users
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#00283C]">
                {data.analytics?.totals?.users ?? "—"}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0077A8]" />
              <h2 className="text-sm font-bold text-[#00283C]">
                Top keyword opportunities
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-50">
                    <th className="px-4 py-2 font-bold">Keyword</th>
                    <th className="px-3 py-2 font-bold">Clicks</th>
                    <th className="px-3 py-2 font-bold">Impr.</th>
                    <th className="px-3 py-2 font-bold">Pos.</th>
                    <th className="px-3 py-2 font-bold">Score</th>
                    <th className="px-4 py-2 font-bold" />
                  </tr>
                </thead>
                <tbody>
                  {topQueries.map((row) => (
                    <tr key={row.query} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-[#00283C] max-w-[18rem]">
                        {row.query}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-gray-600">{row.clicks}</td>
                      <td className="px-3 py-3 tabular-nums text-gray-600">
                        {row.impressions}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-gray-600">
                        {row.position.toFixed(1)}
                      </td>
                      <td className="px-3 py-3 tabular-nums font-semibold text-[#0077A8]">
                        {row.opportunityScore ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={busyQuery === row.query}
                          onClick={() => void generate(row)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00283C] text-white text-xs font-bold hover:bg-[#003d5c] disabled:opacity-60 cursor-pointer"
                        >
                          {busyQuery === row.query ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          Generate blog
                        </button>
                      </td>
                    </tr>
                  ))}
                  {topQueries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No scored opportunities in this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0077A8]" />
              <h2 className="text-sm font-bold text-[#00283C]">Ask about these results</h2>
            </div>
            <div className="p-4 space-y-3 max-h-[22rem] overflow-y-auto bg-[#F8FAFC]">
              {messages.length === 0 && (
                <p className="text-sm text-gray-400">
                  Example: “Which Houston keywords should we write next?” or “Compare AI
                  receptionist vs medical SEO opportunities.”
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#00283C] text-white ml-8"
                      : "bg-white border border-gray-100 text-[#00283C] mr-8"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {chatBusy && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking…
                </div>
              )}
            </div>
            <form
              onSubmit={(e) => void ask(e)}
              className="p-3 border-t border-gray-100 flex gap-2"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question about the GSC / Analytics data…"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0077A8]"
              />
              <button
                type="submit"
                disabled={chatBusy || !chatInput.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0077A8] text-white text-sm font-bold hover:bg-[#005f86] disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Ask
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
