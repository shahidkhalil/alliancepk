"use client";

import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  FileWarning,
  FilePenLine,
} from "lucide-react";
import type { Workspace } from "@/components/admin/AdminSidebar";
import type { LeadFilter } from "@/components/admin/leadHelpers";
import {
  friendlySourceLabel,
  formatLeadDate,
  type LeadRow,
} from "@/components/admin/leadHelpers";
import type { MayaSubTab } from "@/components/MayaDashboard";

export default function AdminHome({
  recentLeads,
  counts,
  onGoWorkspace,
  onGoLeads,
  onGoMaya,
  onGoBlogDrafts,
}: {
  recentLeads: LeadRow[];
  counts: {
    leads: number;
    incomplete: number;
    blogDrafts: number;
    mayaUrgent: number;
    blogs: number;
  };
  onGoWorkspace: (id: Workspace) => void;
  onGoLeads: (filter: LeadFilter) => void;
  onGoMaya: (tab: MayaSubTab) => void;
  onGoBlogDrafts: () => void;
}) {
  const attention: {
    key: string;
    label: string;
    detail: string;
    count: number;
    icon: typeof AlertTriangle;
    tone: string;
    onClick: () => void;
  }[] = [];

  if (counts.mayaUrgent > 0) {
    attention.push({
      key: "maya-urgent",
      label: "Maya urgent",
      detail: "Emergency or high-priority bookings",
      count: counts.mayaUrgent,
      icon: AlertTriangle,
      tone: "border-rose-100 bg-rose-50/70 text-rose-800",
      onClick: () => onGoMaya("urgent"),
    });
  }
  if (counts.incomplete > 0) {
    attention.push({
      key: "incomplete",
      label: "Incomplete forms",
      detail: "People started a form and left",
      count: counts.incomplete,
      icon: FileWarning,
      tone: "border-amber-100 bg-amber-50/70 text-amber-900",
      onClick: () => onGoLeads("incomplete"),
    });
  }
  if (counts.blogDrafts > 0) {
    attention.push({
      key: "blog-drafts",
      label: "Blog drafts",
      detail: "Ready to review and publish",
      count: counts.blogDrafts,
      icon: FilePenLine,
      tone: "border-sky-100 bg-sky-50/70 text-sky-900",
      onClick: onGoBlogDrafts,
    });
  }

  return (
    <div className="space-y-8">
      {attention.length > 0 && (
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Needs attention
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {attention.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className={`text-left rounded-xl border p-4 transition-colors cursor-pointer hover:brightness-[0.98] ${item.tone}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">{item.label}</p>
                        <span className="text-lg font-extrabold tabular-nums">
                          {item.count}
                        </span>
                      </div>
                      <p className="text-xs opacity-80 mt-1">{item.detail}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          At a glance
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["leads", "Leads", counts.leads, () => onGoWorkspace("leads")],
              ["incomplete", "Incomplete", counts.incomplete, () => onGoLeads("incomplete")],
              ["maya", "Maya urgent", counts.mayaUrgent, () => onGoMaya("urgent")],
              ["blogs", "Blogs", counts.blogs, () => onGoWorkspace("blog")],
              ["drafts", "Drafts", counts.blogDrafts, onGoBlogDrafts],
            ] as const
          ).map(([key, label, value, onClick]) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm shadow-sm hover:border-[#0077A8]/40 transition-colors cursor-pointer"
            >
              <span className="font-extrabold text-[#00283C] tabular-nums">{value}</span>
              <span className="text-gray-500 font-medium">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Recent leads
          </p>
          <button
            type="button"
            onClick={() => onGoWorkspace("leads")}
            className="text-xs font-semibold text-[#0077A8] hover:text-[#00283C] cursor-pointer"
          >
            View all
          </button>
        </div>
        {recentLeads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
            No leads yet.
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50 overflow-hidden">
            {recentLeads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => onGoWorkspace("leads")}
                className="w-full text-left px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-center gap-3"
              >
                <ClipboardList className="w-4 h-4 text-[#0077A8] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#00283C] truncate">
                    {lead.name || lead.clinicName || "No name"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {friendlySourceLabel(lead.source)}
                    {lead.clinicName ? ` · ${lead.clinicName}` : ""}
                  </p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0 tabular-nums">
                  {formatLeadDate(lead.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
