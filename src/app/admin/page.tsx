"use client";

import { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import {
  Loader2,
  LogOut,
  Inbox,
  FileWarning,
  Bot,
  LayoutDashboard,
  Menu,
  X,
  BarChart3,
  AlertTriangle,
  CalendarCheck,
  Users,
  ChevronRight,
  ChevronDown,
  Globe,
  ClipboardCheck,
  Package,
  Bell,
  type LucideIcon,
} from "lucide-react";
import MayaDashboard, {
  isMayaLeadSource,
  type MayaSubTab,
} from "@/components/MayaDashboard";
import PaginationBar, { paginate } from "@/components/PaginationBar";

type LeadRow = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  clinicName?: string;
  clinicType?: string;
  message?: string;
  source?: string;
  website?: string;
  auditScore?: number;
  step?: number;
  completionStatus?: string;
  urgent?: boolean;
  priority?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type NavId =
  | "home"
  | "leads-all"
  | "leads-website"
  | "leads-audits"
  | "leads-packages"
  | "leads-incomplete"
  | "leads-maya"
  | "maya-overview"
  | "maya-urgent"
  | "maya-bookings"
  | "maya-reminders"
  | "maya-patients";

type NavGroupId = "overview" | "leads" | "maya";

const AUDIT_SOURCES = new Set(["audit_bot", "business_growth_audit", "website_audit_gate"]);
const PACKAGE_SOURCES = new Set(["package_order", "pricing_package"]);

function isAuditLead(source?: string) {
  return Boolean(source && AUDIT_SOURCES.has(source));
}

function isPackageLead(source?: string) {
  return Boolean(source && PACKAGE_SOURCES.has(source));
}

function isWebsiteLead(source?: string) {
  if (!source || isMayaLeadSource(source) || isAuditLead(source) || isPackageLead(source)) {
    return false;
  }
  // Consultation, contact, and any other non-Maya marketing sources
  return true;
}

function formatDate(ts?: Timestamp | null) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function LeadCard({ lead, incomplete }: { lead: LeadRow; incomplete?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-bold text-[#00283C] text-lg">{lead.name || "No name yet"}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {incomplete
              ? `Last updated ${formatDate(lead.updatedAt || lead.createdAt)}`
              : formatDate(lead.createdAt)}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            incomplete ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {incomplete ? `Incomplete · Step ${(lead.step ?? 0) + 1}` : "Submitted"}
        </span>
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
        <div>
          <dt className="text-gray-400 text-xs">Source</dt>
          <dd className="text-[#00283C] font-medium">{lead.source || "—"}</dd>
        </div>
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

const PAGE_META: Record<NavId, { title: string; subtitle: string; category: string }> = {
  home: {
    title: "Dashboard",
    subtitle: "Overview of leads and Maya activity",
    category: "Overview",
  },
  "leads-all": {
    title: "All submissions",
    subtitle: "Every completed lead across all channels",
    category: "Leads & forms",
  },
  "leads-website": {
    title: "Website & contact",
    subtitle: "Consultation and contact form leads",
    category: "Leads & forms",
  },
  "leads-audits": {
    title: "Audits",
    subtitle: "Website audit and business growth audit leads",
    category: "Leads & forms",
  },
  "leads-packages": {
    title: "Package orders",
    subtitle: "Pricing and package requests",
    category: "Leads & forms",
  },
  "leads-incomplete": {
    title: "Incomplete forms",
    subtitle: "Users who started a form and left",
    category: "Leads & forms",
  },
  "leads-maya": {
    title: "Maya leads",
    subtitle: "Leads created by the AI receptionist",
    category: "Maya AI",
  },
  "maya-overview": {
    title: "Maya stats",
    subtitle: "Bookings, channels, and reminders (last 50)",
    category: "Maya AI",
  },
  "maya-urgent": {
    title: "Urgent queue",
    subtitle: "Emergency and high-priority appointments",
    category: "Maya AI",
  },
  "maya-bookings": {
    title: "Bookings",
    subtitle: "Lead scores, visit prep, and status updates",
    category: "Maya AI",
  },
  "maya-reminders": {
    title: "Reminders",
    subtitle: "24h / 1h reminder coverage from existing flags",
    category: "Maya AI",
  },
  "maya-patients": {
    title: "Patient memory",
    subtitle: "Preferences, pending questions, visit history",
    category: "Maya AI",
  },
};

function mayaSectionFromNav(id: NavId): MayaSubTab | null {
  if (id === "maya-overview") return "overview";
  if (id === "maya-urgent") return "urgent";
  if (id === "maya-bookings") return "bookings";
  if (id === "maya-reminders") return "reminders";
  if (id === "maya-patients") return "patients";
  return null;
}

function groupForNav(id: NavId): NavGroupId {
  if (id === "home") return "overview";
  if (id.startsWith("maya-") || id === "leads-maya") return "maya";
  return "leads";
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [nav, setNav] = useState<NavId>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [openGroups, setOpenGroups] = useState<Record<NavGroupId, boolean>>({
    overview: true,
    leads: true,
    maya: true,
  });
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [drafts, setDrafts] = useState<LeadRow[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setLeads([]);
      setDrafts([]);
      return;
    }
    setLoadingData(true);
    const leadsQ = query(collection(getDb(), "leads"), orderBy("createdAt", "desc"));
    const draftsQ = query(collection(getDb(), "form_drafts"), orderBy("updatedAt", "desc"));

    const unsubLeads = onSnapshot(
      leadsQ,
      (snap) => {
        setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadRow)));
        setLoadingData(false);
      },
      () => setLoadingData(false)
    );
    const unsubDrafts = onSnapshot(draftsQ, (snap) => {
      setDrafts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadRow)));
    });

    return () => {
      unsubLeads();
      unsubDrafts();
    };
  }, [user]);

  // Keep the active category expanded when navigating
  useEffect(() => {
    const g = groupForNav(nav);
    setOpenGroups((prev) => (prev[g] ? prev : { ...prev, [g]: true }));
  }, [nav]);

  const incompleteDrafts = useMemo(
    () => drafts.filter((d) => d.completionStatus !== "submitted"),
    [drafts]
  );

  const mayaLeads = useMemo(
    () => leads.filter((l) => isMayaLeadSource(l.source)),
    [leads]
  );

  const websiteLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          !isMayaLeadSource(l.source) &&
          !isAuditLead(l.source) &&
          !isPackageLead(l.source) &&
          isWebsiteLead(l.source)
      ),
    [leads]
  );

  const auditLeads = useMemo(
    () => leads.filter((l) => isAuditLead(l.source)),
    [leads]
  );

  const packageLeads = useMemo(
    () => leads.filter((l) => isPackageLead(l.source)),
    [leads]
  );

  const counts = useMemo(
    () => ({
      all: leads.length,
      website: websiteLeads.length,
      audits: auditLeads.length,
      packages: packageLeads.length,
      incomplete: incompleteDrafts.length,
      maya: mayaLeads.length,
    }),
    [leads, websiteLeads, auditLeads, packageLeads, incompleteDrafts, mayaLeads]
  );

  const go = (id: NavId) => {
    setNav(id);
    setListPage(1);
    setSidebarOpen(false);
  };

  const toggleGroup = (id: NavGroupId) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    } catch {
      setLoginError("Invalid email or password.");
    } finally {
      setLoggingIn(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0077A8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-lg p-8"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0077A8] mb-2">
            Alliance Tech
          </p>
          <h1 className="text-2xl font-extrabold text-[#00283C] mb-1">Admin console</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to manage leads and Maya.</p>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0077A8]"
          />
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0077A8]"
          />
          {loginError && <p className="text-red-500 text-sm mb-3">{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3.5 rounded-xl bg-[#00283C] text-white font-bold text-sm hover:bg-[#003d5c] transition-colors disabled:opacity-60"
          >
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  const meta = PAGE_META[nav];
  const mayaSection = mayaSectionFromNav(nav);

  const leadList =
    nav === "leads-incomplete"
      ? incompleteDrafts
      : nav === "leads-maya"
        ? mayaLeads
        : nav === "leads-website"
          ? websiteLeads
          : nav === "leads-audits"
            ? auditLeads
            : nav === "leads-packages"
              ? packageLeads
              : nav === "leads-all"
                ? leads
                : null;

  type NavItem = { id: NavId; label: string; icon: LucideIcon; count?: number };

  const navGroups: {
    id: NavGroupId;
    label: string;
    hint: string;
    items: NavItem[];
  }[] = [
    {
      id: "overview",
      label: "Overview",
      hint: "Home",
      items: [{ id: "home", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      id: "leads",
      label: "Leads & forms",
      hint: "Inbound marketing",
      items: [
        { id: "leads-all", label: "All submissions", icon: Inbox, count: counts.all },
        { id: "leads-website", label: "Website & contact", icon: Globe, count: counts.website },
        { id: "leads-audits", label: "Audits", icon: ClipboardCheck, count: counts.audits },
        { id: "leads-packages", label: "Package orders", icon: Package, count: counts.packages },
        {
          id: "leads-incomplete",
          label: "Incomplete forms",
          icon: FileWarning,
          count: counts.incomplete,
        },
      ],
    },
    {
      id: "maya",
      label: "Maya AI",
      hint: "Receptionist",
      items: [
        { id: "maya-overview", label: "Stats", icon: BarChart3 },
        { id: "maya-urgent", label: "Urgent queue", icon: AlertTriangle },
        { id: "maya-bookings", label: "Bookings", icon: CalendarCheck },
        { id: "maya-reminders", label: "Reminders", icon: Bell },
        { id: "maya-patients", label: "Patient memory", icon: Users },
        { id: "leads-maya", label: "Maya leads", icon: Bot, count: counts.maya },
      ],
    },
  ];

  const SidebarNav = (
    <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-2">
      {navGroups.map((group) => {
        const open = openGroups[group.id];
        const groupActive = group.items.some((i) => i.id === nav);
        return (
          <div
            key={group.id}
            className={`rounded-xl ${groupActive ? "bg-white/5" : ""}`}
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
            >
              <span className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#00B4D8]">
                  {group.label}
                </span>
                <span className="block text-[11px] text-white/35 mt-0.5">{group.hint}</span>
              </span>
              {open ? (
                <ChevronDown className="w-4 h-4 text-white/40" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/40" />
              )}
            </button>
            {open && (
              <ul className="pb-2 px-1 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = nav === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => go(item.id)}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "bg-[#0077A8] text-white shadow-sm"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 opacity-90" />
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {typeof item.count === "number" && (
                          <span
                            className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                              active ? "bg-white/25 text-white" : "bg-white/10 text-white/45"
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex">
      {/* Desktop / tablet sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col bg-[#00283C] text-white sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-extrabold text-lg tracking-tight">Alliance Admin</p>
          <p className="text-[11px] text-white/45 mt-0.5 truncate">{user.email}</p>
        </div>
        {SidebarNav}
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => signOut(getFirebaseAuth())}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/8 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-80 max-w-[88vw] flex flex-col bg-[#00283C] text-white shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="font-extrabold tracking-tight">Alliance Admin</p>
                <p className="text-[11px] text-white/45 truncate max-w-[12rem]">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {SidebarNav}
            <div className="p-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => signOut(getFirebaseAuth())}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/8"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200/80">
          <div className="h-14 px-4 sm:px-6 flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#0077A8]">
                {meta.category}
              </p>
              <h1 className="text-base sm:text-lg font-extrabold text-[#00283C] truncate leading-tight">
                {meta.title}
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-6xl w-full mx-auto">
          <p className="text-sm text-gray-500 mb-6">{meta.subtitle}</p>

          {nav === "home" && (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Leads & forms
                </p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {(
                    [
                      ["leads-all", "All submissions", counts.all, "Every channel"],
                      ["leads-website", "Website & contact", counts.website, "Forms"],
                      ["leads-audits", "Audits", counts.audits, "Growth & site"],
                      ["leads-packages", "Package orders", counts.packages, "Pricing"],
                      ["leads-incomplete", "Incomplete", counts.incomplete, "Abandoned"],
                    ] as const
                  ).map(([id, label, value, hint]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => go(id)}
                      className="text-left rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-[#0077A8]/35 transition-colors"
                    >
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {label}
                      </p>
                      <p className="mt-2 text-3xl font-extrabold text-[#00283C]">{value}</p>
                      <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                        {hint}
                        <ChevronRight className="w-3 h-3" />
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Maya AI
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {(
                    [
                      ["maya-overview", "Stats overview", BarChart3],
                      ["maya-urgent", "Urgent queue", AlertTriangle],
                      ["maya-bookings", "Bookings & scores", CalendarCheck],
                      ["maya-reminders", "Reminders health", Bell],
                      ["maya-patients", "Patient memory", Users],
                      ["leads-maya", "Maya leads", Bot],
                    ] as const
                  ).map(([id, label, Icon]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => go(id)}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 text-left hover:border-[#0077A8]/40 hover:bg-[#F8FAFC] transition-colors shadow-sm"
                    >
                      <Icon className="w-4 h-4 text-[#0077A8]" />
                      <span className="text-sm font-semibold text-[#00283C]">{label}</span>
                      {id === "leads-maya" && (
                        <span className="ml-auto text-xs font-bold text-gray-400 tabular-nums">
                          {counts.maya}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {leadList &&
            (loadingData ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#0077A8]" />
              </div>
            ) : leadList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400 text-sm">
                Nothing here yet.
              </div>
            ) : (
              (() => {
                const paged = paginate(leadList, listPage);
                return (
                  <div className="space-y-4">
                    {paged.slice.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        incomplete={nav === "leads-incomplete"}
                      />
                    ))}
                    <PaginationBar
                      page={paged.page}
                      totalPages={paged.totalPages}
                      total={paged.total}
                      from={paged.from}
                      to={paged.to}
                      onChange={setListPage}
                    />
                  </div>
                );
              })()
            ))}

          {mayaSection && (
            <MayaDashboard
              mayaLeads={mayaLeads}
              section={mayaSection}
              hideChrome
              onNavigate={(section) => {
                const map: Record<MayaSubTab, NavId> = {
                  overview: "maya-overview",
                  urgent: "maya-urgent",
                  bookings: "maya-bookings",
                  reminders: "maya-reminders",
                  patients: "maya-patients",
                };
                go(map[section]);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
