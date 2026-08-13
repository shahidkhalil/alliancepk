"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import PaginationBar, { paginate } from "@/components/PaginationBar";
import {
  friendlySourceLabel,
  formatLeadDate,
  matchesLeadSearch,
  type LeadFilter,
  type LeadRow,
} from "@/components/admin/leadHelpers";

function LeadCard({ lead, incomplete }: { lead: LeadRow; incomplete?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-bold text-[#00283C] text-base sm:text-lg truncate">
            {lead.name || "No name yet"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {incomplete
              ? `Last updated ${formatLeadDate(lead.updatedAt || lead.createdAt)}`
              : formatLeadDate(lead.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {friendlySourceLabel(lead.source)}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              incomplete ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {incomplete ? `Incomplete · Step ${(lead.step ?? 0) + 1}` : "Submitted"}
          </span>
        </div>
      </div>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-gray-400 text-xs">Phone</dt>
          <dd className="text-[#00283C] font-medium">{lead.phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Email</dt>
          <dd className="text-[#00283C] font-medium break-all">{lead.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Clinic</dt>
          <dd className="text-[#00283C] font-medium">{lead.clinicName || "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Type</dt>
          <dd className="text-[#00283C] font-medium">{lead.clinicType || "—"}</dd>
        </div>
        {lead.website && (
          <div className="sm:col-span-2">
            <dt className="text-gray-400 text-xs">Website</dt>
            <dd className="text-[#0077A8] font-medium break-all">{lead.website}</dd>
          </div>
        )}
        {lead.auditScore != null && (
          <div>
            <dt className="text-gray-400 text-xs">Audit score</dt>
            <dd className="text-[#00283C] font-medium">{lead.auditScore}/100</dd>
          </div>
        )}
        {lead.message && (
          <div className="sm:col-span-2">
            <dt className="text-gray-400 text-xs">Message</dt>
            <dd className="text-gray-600">{lead.message}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

export default function AdminLeads({
  filter,
  onFilterChange,
  leads,
  websiteLeads,
  auditLeads,
  packageLeads,
  incompleteDrafts,
  loading,
}: {
  filter: LeadFilter;
  onFilterChange: (f: LeadFilter) => void;
  leads: LeadRow[];
  websiteLeads: LeadRow[];
  auditLeads: LeadRow[];
  packageLeads: LeadRow[];
  incompleteDrafts: LeadRow[];
  loading: boolean;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const counts = {
    all: leads.length,
    website: websiteLeads.length,
    audits: auditLeads.length,
    packages: packageLeads.length,
    incomplete: incompleteDrafts.length,
  };

  const list =
    filter === "incomplete"
      ? incompleteDrafts
      : filter === "website"
        ? websiteLeads
        : filter === "audits"
          ? auditLeads
          : filter === "packages"
            ? packageLeads
            : leads;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((l) => matchesLeadSearch(l, q));
  }, [list, query]);

  const setFilter = (f: LeadFilter) => {
    onFilterChange(f);
    setPage(1);
  };

  const tabs: { id: LeadFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "website", label: "Website", count: counts.website },
    { id: "audits", label: "Audits", count: counts.audits },
    { id: "packages", label: "Packages", count: counts.packages },
    { id: "incomplete", label: "Incomplete", count: counts.incomplete },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
          {tabs.map((t) => {
            const active = filter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? "bg-[#00283C] text-white"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#00283C]"
                }`}
              >
                {t.label}
                <span
                  className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, phone, clinic…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0077A8] bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#0077A8]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400 text-sm">
          Nothing here yet.
        </div>
      ) : (
        (() => {
          const paged = paginate(filtered, page);
          return (
            <div className="space-y-3">
              {paged.slice.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  incomplete={filter === "incomplete"}
                />
              ))}
              <PaginationBar
                page={paged.page}
                totalPages={paged.totalPages}
                total={paged.total}
                from={paged.from}
                to={paged.to}
                onChange={setPage}
              />
            </div>
          );
        })()
      )}
    </div>
  );
}
