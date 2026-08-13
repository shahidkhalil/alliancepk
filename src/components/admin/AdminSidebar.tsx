"use client";

import {
  LayoutDashboard,
  Inbox,
  Bot,
  FileText,
  LogOut,
  X,
  LineChart,
  type LucideIcon,
} from "lucide-react";

export type Workspace = "home" | "leads" | "maya" | "blog" | "insights";

const ITEMS: {
  id: Workspace;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { id: "home", label: "Home", hint: "What needs you", icon: LayoutDashboard },
  { id: "leads", label: "Leads", hint: "Forms & orders", icon: Inbox },
  { id: "maya", label: "Maya", hint: "AI receptionist", icon: Bot },
  { id: "blog", label: "Blog", hint: "Write & publish", icon: FileText },
  { id: "insights", label: "Insights", hint: "GSC + blogs", icon: LineChart },
];

export default function AdminSidebar({
  workspace,
  onNavigate,
  onSignOut,
  userEmail,
  badges,
  mobile,
  onClose,
}: {
  workspace: Workspace;
  onNavigate: (id: Workspace) => void;
  onSignOut: () => void;
  userEmail?: string | null;
  badges: Partial<Record<Workspace, number>>;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full w-full bg-[#00283C] text-white">
      <div className="px-5 py-5 border-b border-white/10 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-extrabold text-lg tracking-tight">Alliance Admin</p>
          <p className="text-[11px] text-white/45 mt-0.5 truncate">{userEmail}</p>
        </div>
        {mobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = workspace === item.id;
          const count = badges[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors cursor-pointer ${
                active
                  ? "bg-[#0077A8] text-white shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0 opacity-90" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span
                  className={`block text-[11px] mt-0.5 ${
                    active ? "text-white/70" : "text-white/35"
                  }`}
                >
                  {item.hint}
                </span>
              </span>
              {typeof count === "number" && count > 0 && (
                <span
                  className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                    active ? "bg-white/25 text-white" : "bg-white/10 text-white/55"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/8 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
