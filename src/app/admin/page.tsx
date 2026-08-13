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
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { subscribeAllBlogs } from "@/lib/firestoreBlogs";
import MayaDashboard, {
  isMayaLeadSource,
  type MayaSubTab,
} from "@/components/MayaDashboard";
import AdminBlogManager from "@/components/AdminBlogManager";
import AdminSidebar, { type Workspace } from "@/components/admin/AdminSidebar";
import AdminHome from "@/components/admin/AdminHome";
import AdminLeads from "@/components/admin/AdminLeads";
import AdminInsights from "@/components/admin/AdminInsights";
import {
  isAuditLead,
  isPackageLead,
  isWebsiteLead,
  type LeadFilter,
  type LeadRow,
} from "@/components/admin/leadHelpers";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarCheck,
  Loader2,
  Menu,
  Users,
} from "lucide-react";

const WORKSPACE_META: Record<Workspace, { title: string; subtitle: string }> = {
  home: {
    title: "Home",
    subtitle: "What needs attention and recent activity",
  },
  leads: {
    title: "Leads",
    subtitle: "Review and follow up on form submissions",
  },
  maya: {
    title: "Maya",
    subtitle: "Urgent bookings, appointments, and patient memory",
  },
  blog: {
    title: "Blog",
    subtitle: "Create, edit, and publish posts in one place",
  },
  insights: {
    title: "Insights",
    subtitle: "Search Console & Analytics — ask questions and generate blogs",
  },
};

const MAYA_TABS: { id: MayaSubTab; label: string; icon: typeof AlertTriangle }[] = [
  { id: "urgent", label: "Urgent", icon: AlertTriangle },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "patients", label: "Patients", icon: Users },
  { id: "overview", label: "Stats", icon: BarChart3 },
];

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [workspace, setWorkspace] = useState<Workspace>("home");
  const [leadFilter, setLeadFilter] = useState<LeadFilter>("all");
  const [mayaTab, setMayaTab] = useState<MayaSubTab>("urgent");
  const [blogStartFilter, setBlogStartFilter] = useState<"all" | "live" | "draft" | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [drafts, setDrafts] = useState<LeadRow[]>([]);
  const [blogDraftCount, setBlogDraftCount] = useState(0);
  const [blogTotalCount, setBlogTotalCount] = useState(0);
  const [mayaUrgentCount, setMayaUrgentCount] = useState(0);
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
      setBlogDraftCount(0);
      setBlogTotalCount(0);
      setMayaUrgentCount(0);
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
    const unsubBlogDrafts = subscribeAllBlogs(
      (rows) => {
        setBlogTotalCount(rows.length);
        setBlogDraftCount(rows.filter((b) => !b.published).length);
      },
      () => {
        setBlogTotalCount(0);
        setBlogDraftCount(0);
      }
    );

    void getDocs(
      query(collection(getDb(), "appointments"), orderBy("createdAt", "desc"), limit(50))
    )
      .then((snap) => {
        const urgent = snap.docs.filter((d) => {
          const data = d.data();
          return (
            data.urgent ||
            data.priority === "urgent" ||
            data.source === "ai_receptionist_emergency"
          );
        }).length;
        setMayaUrgentCount(urgent);
      })
      .catch(() => setMayaUrgentCount(0));

    return () => {
      unsubLeads();
      unsubDrafts();
      unsubBlogDrafts();
    };
  }, [user]);

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

  const marketingLeads = useMemo(
    () => leads.filter((l) => !isMayaLeadSource(l.source)),
    [leads]
  );

  const go = (id: Workspace) => {
    setWorkspace(id);
    setSidebarOpen(false);
    if (id !== "blog") setBlogStartFilter(null);
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
          <p className="text-sm text-gray-500 mb-6">Sign in to manage leads, Maya, and blogs.</p>
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
            className="w-full py-3.5 rounded-xl bg-[#00283C] text-white font-bold text-sm hover:bg-[#003d5c] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  const meta = WORKSPACE_META[workspace];
  const attentionTotal =
    (mayaUrgentCount > 0 ? 1 : 0) +
    (incompleteDrafts.length > 0 ? 1 : 0) +
    (blogDraftCount > 0 ? 1 : 0);

  const sidebarBadges: Partial<Record<Workspace, number>> = {
    home: attentionTotal,
    leads: marketingLeads.length,
    maya: mayaUrgentCount,
    blog: blogDraftCount,
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex">
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 sticky top-0 h-screen">
        <AdminSidebar
          workspace={workspace}
          onNavigate={go}
          onSignOut={() => signOut(getFirebaseAuth())}
          userEmail={user.email}
          badges={sidebarBadges}
        />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 cursor-pointer"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-80 max-w-[88vw] shadow-2xl">
            <AdminSidebar
              workspace={workspace}
              onNavigate={go}
              onSignOut={() => signOut(getFirebaseAuth())}
              userEmail={user.email}
              badges={sidebarBadges}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200/80">
          <div className="h-14 px-4 sm:px-6 flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-extrabold text-[#00283C] truncate leading-tight">
                {meta.title}
              </h1>
              <p className="text-xs text-gray-400 truncate hidden sm:block">{meta.subtitle}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-6xl w-full mx-auto">
          {workspace === "home" && (
            <AdminHome
              recentLeads={marketingLeads.slice(0, 5)}
              counts={{
                leads: marketingLeads.length,
                incomplete: incompleteDrafts.length,
                blogDrafts: blogDraftCount,
                mayaUrgent: mayaUrgentCount,
                blogs: blogTotalCount,
              }}
              onGoWorkspace={go}
              onGoLeads={(f) => {
                setLeadFilter(f);
                go("leads");
              }}
              onGoMaya={(tab) => {
                setMayaTab(tab);
                go("maya");
              }}
              onGoBlogDrafts={() => {
                setBlogStartFilter("draft");
                go("blog");
              }}
            />
          )}

          {workspace === "leads" && (
            <AdminLeads
              filter={leadFilter}
              onFilterChange={setLeadFilter}
              leads={marketingLeads}
              websiteLeads={websiteLeads}
              auditLeads={auditLeads}
              packageLeads={packageLeads}
              incompleteDrafts={incompleteDrafts}
              loading={loadingData}
            />
          )}

          {workspace === "maya" && (
            <div className="space-y-4">
              <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
                {MAYA_TABS.map((t) => {
                  const Icon = t.icon;
                  const active = mayaTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMayaTab(t.id)}
                      className={`flex flex-1 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? "bg-[#00283C] text-white"
                          : "text-gray-500 hover:bg-gray-50 hover:text-[#00283C]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <MayaDashboard
                mayaLeads={mayaLeads}
                section={mayaTab}
                hideChrome
                onNavigate={setMayaTab}
              />
            </div>
          )}

          {workspace === "blog" && (
            <AdminBlogManager
              initialFilter={blogStartFilter ?? undefined}
              onCountChange={(total, draftsCount) => {
                setBlogTotalCount(total);
                setBlogDraftCount(draftsCount);
              }}
            />
          )}

          {workspace === "insights" && (
            <AdminInsights
              onBlogCreated={() => {
                setBlogStartFilter("draft");
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
