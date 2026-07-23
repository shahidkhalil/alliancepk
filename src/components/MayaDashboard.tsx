"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase";
import {
  channelLabel,
  computeMayaLeadScore,
  isMayaLeadSource,
} from "@/lib/mayaLeadScore";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  Bot,
  Users,
  BarChart3,
  CalendarCheck,
  Bell,
} from "lucide-react";
import PaginationBar, { paginate } from "@/components/PaginationBar";

type MayaSubTab = "overview" | "urgent" | "bookings" | "patients" | "reminders";
type DateRange = "7d" | "30d" | "all";
type ApptStatus = "new" | "completed" | "cancelled";

export type { MayaSubTab };

type AppointmentRow = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  preferredTime?: string;
  notes?: string;
  triageReason?: string;
  source?: string;
  status?: string;
  priority?: string;
  urgent?: boolean;
  clinicName?: string;
  phoneDigits?: string;
  reminder24hSent?: boolean;
  reminder1hSent?: boolean;
  createdAt?: Timestamp | null;
};

type PatientRow = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  phoneDigits?: string;
  visitCount?: number;
  lastService?: string;
  lastPreferredTime?: string;
  preVisitNotes?: string;
  pendingQuestions?: { text?: string; askedAt?: string; topic?: string }[];
  preferences?: {
    language?: string;
    tone?: string;
    topicsOfInterest?: string[];
    notes?: string;
  };
  updatedAt?: Timestamp | null;
};

type MayaLeadLite = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  source?: string;
  message?: string;
  urgent?: boolean;
  priority?: string;
  createdAt?: Timestamp | null;
};

type ScoredRow = {
  appointment: AppointmentRow;
  patient?: PatientRow;
  score: number;
  tier: string;
  label: string;
};

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

function digits(phone?: string) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}

function inRange(ts: Timestamp | null | undefined, range: DateRange) {
  if (range === "all") return true;
  const t = ts?.toDate?.()?.getTime?.() ?? 0;
  if (!t) return false;
  const days = range === "7d" ? 7 : 30;
  return t >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function ScoreChip({ score, tier, label }: { score: number; tier: string; label: string }) {
  const cls =
    tier === "high"
      ? "bg-emerald-50 text-emerald-700"
      : tier === "medium"
        ? "bg-amber-50 text-amber-700"
        : "bg-gray-100 text-gray-600";
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${cls}`}>
      {label} · {score}
    </span>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#00283C]">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-gray-400">{hint}</p> : null}
    </div>
  );
}

function DateRangePills({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
      {(
        [
          ["7d", "7 days"],
          ["30d", "30 days"],
          ["all", "All"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            value === id
              ? "bg-[#00283C] text-white"
              : "text-gray-500 hover:text-[#00283C]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function StatusButtons({
  appointmentId,
  status,
  busy,
  onUpdate,
}: {
  appointmentId: string;
  status?: string;
  busy: boolean;
  onUpdate: (id: string, status: ApptStatus) => void;
}) {
  const current = (status || "new") as ApptStatus;
  const options: ApptStatus[] = ["new", "completed", "cancelled"];
  return (
    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 self-center mr-1">
        Status
      </span>
      {options.map((s) => (
        <button
          key={s}
          type="button"
          disabled={busy || current === s}
          onClick={() => onUpdate(appointmentId, s)}
          className={`text-[11px] font-bold capitalize px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
            current === s
              ? s === "completed"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : s === "cancelled"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-[#F0F7FA] border-[#0077A8]/30 text-[#0077A8]"
              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function BookingCard({
  row,
  busyId,
  onStatus,
}: {
  row: ScoredRow;
  busyId: string | null;
  onStatus: (id: string, status: ApptStatus) => void;
}) {
  const { appointment: a, patient: p, score, tier, label } = row;
  const prep =
    p?.preVisitNotes ||
    a.notes ||
    a.triageReason ||
    (p?.pendingQuestions?.length
      ? p.pendingQuestions
          .map((q) => q.text)
          .filter(Boolean)
          .slice(0, 3)
          .join(" · ")
      : "");

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-bold text-[#00283C] text-lg">{a.name || "No name"}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(a.createdAt)} · {channelLabel(a.source)}
            {a.status ? ` · ${a.status}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ScoreChip score={score} tier={tier} label={label} />
          {(a.urgent || a.priority === "urgent") && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">
              Urgent
            </span>
          )}
        </div>
      </div>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-gray-400 text-xs">Phone</dt>
          <dd className="font-medium text-[#00283C]">{a.phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Email</dt>
          <dd className="font-medium text-[#00283C] break-all">{a.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Service</dt>
          <dd className="font-medium text-[#00283C]">{a.service || "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Preferred time</dt>
          <dd className="font-medium text-[#00283C]">{a.preferredTime || "—"}</dd>
        </div>
        {(a.reminder24hSent || a.reminder1hSent) && (
          <div className="sm:col-span-2">
            <dt className="text-gray-400 text-xs">Reminders</dt>
            <dd className="font-medium text-[#00283C]">
              {[a.reminder24hSent ? "24h sent" : null, a.reminder1hSent ? "1h sent" : null]
                .filter(Boolean)
                .join(" · ")}
            </dd>
          </div>
        )}
        {prep && (
          <div className="sm:col-span-2">
            <dt className="text-gray-400 text-xs">Visit prep / notes</dt>
            <dd className="text-gray-600">{prep}</dd>
          </div>
        )}
      </dl>
      <StatusButtons
        appointmentId={a.id}
        status={a.status}
        busy={busyId === a.id}
        onUpdate={onStatus}
      />
    </div>
  );
}

export default function MayaDashboard({
  mayaLeads,
  section,
  hideChrome = false,
  onNavigate,
}: {
  mayaLeads: MayaLeadLite[];
  section?: MayaSubTab;
  hideChrome?: boolean;
  onNavigate?: (section: MayaSubTab) => void;
}) {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [internalTab, setInternalTab] = useState<MayaSubTab>("overview");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [statusBusy, setStatusBusy] = useState<string | null>(null);
  const [listPage, setListPage] = useState(1);
  const subTab = section ?? internalTab;
  const setSubTab = (id: MayaSubTab) => {
    setListPage(1);
    if (onNavigate) onNavigate(id);
    else if (!section) setInternalTab(id);
  };

  useEffect(() => {
    setListPage(1);
  }, [section, dateRange]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const db = getDb();
      const apptQ = query(
        collection(db, "appointments"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const patQ = query(
        collection(db, "patients"),
        orderBy("updatedAt", "desc"),
        limit(50)
      );
      const [apptSnap, patSnap] = await Promise.all([getDocs(apptQ), getDocs(patQ)]);
      setAppointments(
        apptSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AppointmentRow))
      );
      setPatients(patSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PatientRow)));
      setLoadedOnce(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load Maya data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadedOnce) void load();
  }, [loadedOnce, load]);

  const updateStatus = async (id: string, status: ApptStatus) => {
    setStatusBusy(id);
    setError("");
    try {
      const email = getFirebaseAuth().currentUser?.email || "admin";
      await updateDoc(doc(getDb(), "appointments", id), {
        status,
        statusUpdatedAt: serverTimestamp(),
        statusUpdatedBy: email,
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update status");
    } finally {
      setStatusBusy(null);
    }
  };

  const patientByPhone = useMemo(() => {
    const map = new Map<string, PatientRow>();
    for (const p of patients) {
      const key = p.phoneDigits || digits(p.phone);
      if (key) map.set(key, p);
    }
    return map;
  }, [patients]);

  const filteredAppointments = useMemo(
    () => appointments.filter((a) => inRange(a.createdAt, dateRange)),
    [appointments, dateRange]
  );

  const scoredAppointments = useMemo(() => {
    return filteredAppointments.map((a) => {
      const pat = patientByPhone.get(a.phoneDigits || digits(a.phone));
      const scored = computeMayaLeadScore({
        urgent: a.urgent,
        priority: a.priority,
        phone: a.phone,
        email: a.email,
        service: a.service,
        preferredTime: a.preferredTime,
        source: a.source,
        notes: a.notes,
        triageReason: a.triageReason,
        visitCount: pat?.visitCount,
      });
      return { appointment: a, patient: pat, ...scored } as ScoredRow;
    });
  }, [filteredAppointments, patientByPhone]);

  const urgentQueue = useMemo(
    () =>
      scoredAppointments.filter(
        (r) =>
          r.appointment.urgent ||
          r.appointment.priority === "urgent" ||
          r.appointment.source === "ai_receptionist_emergency"
      ),
    [scoredAppointments]
  );

  const reminderRows = useMemo(() => {
    const withEmail = filteredAppointments.filter((a) => String(a.email || "").trim());
    return {
      sent24: withEmail.filter((a) => a.reminder24hSent),
      sent1: withEmail.filter((a) => a.reminder1hSent),
      pending: withEmail.filter((a) => !a.reminder24hSent && !a.reminder1hSent),
      noEmail: filteredAppointments.filter((a) => !String(a.email || "").trim()),
    };
  }, [filteredAppointments]);

  const stats = useMemo(() => {
    let urgent = 0;
    let chat = 0;
    let live = 0;
    let emergency = 0;
    let remindersOk = 0;
    let completed = 0;
    let cancelled = 0;

    for (const a of filteredAppointments) {
      if (a.urgent || a.priority === "urgent") urgent += 1;
      if (a.source === "ai_receptionist_live") live += 1;
      else if (a.source === "ai_receptionist_emergency") emergency += 1;
      else chat += 1;
      if (a.reminder24hSent || a.reminder1hSent) remindersOk += 1;
      if (a.status === "completed") completed += 1;
      if (a.status === "cancelled") cancelled += 1;
    }

    return {
      total: filteredAppointments.length,
      urgent,
      chat,
      live,
      emergency,
      remindersOk,
      completed,
      cancelled,
      mayaLeadCount: mayaLeads.filter((l) => inRange(l.createdAt, dateRange)).length,
    };
  }, [filteredAppointments, mayaLeads, dateRange]);

  const tabs: { id: MayaSubTab; label: string; count?: number; icon: typeof Bot }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "urgent", label: "Urgent", count: urgentQueue.length, icon: AlertTriangle },
    { id: "bookings", label: "Bookings", count: scoredAppointments.length, icon: CalendarCheck },
    { id: "reminders", label: "Reminders", count: reminderRows.pending.length, icon: Bell },
    { id: "patients", label: "Patients", count: patients.length, icon: Users },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <DateRangePills value={dateRange} onChange={setDateRange} />
      <button
        type="button"
        onClick={() => void load()}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#00283C] hover:border-[#0077A8] disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        Refresh
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {!hideChrome && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#00283C] flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#0077A8]" />
                Maya dashboard
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Last 50 bookings &amp; patients · scores computed in-browser (not stored)
              </p>
            </div>
          </div>
          {toolbar}
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = subTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSubTab(t.id)}
                  className={`flex flex-1 min-w-[6.5rem] items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? "bg-[#00283C] text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#00283C]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {t.label}
                  {typeof t.count === "number" && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {hideChrome && toolbar}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !loadedOnce ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#0077A8]" />
        </div>
      ) : (
        <>
          {subTab === "overview" && (
            <section className="space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Bookings" value={stats.total} hint={`Range: ${dateRange}`} />
                <StatCard label="Urgent" value={stats.urgent} />
                <StatCard
                  label="Channels"
                  value={`${stats.chat} / ${stats.live}`}
                  hint="Chat / live voice"
                />
                <StatCard label="Completed" value={stats.completed} />
              </div>
              <div className="grid sm:grid-cols-4 gap-3">
                <StatCard label="Emergency" value={stats.emergency} />
                <StatCard label="Reminders sent" value={stats.remindersOk} />
                <StatCard label="Cancelled" value={stats.cancelled} />
                <StatCard label="Maya leads" value={stats.mayaLeadCount} />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {(
                  [
                    ["urgent", "Urgent", urgentQueue.length, "border-rose-100 bg-rose-50/60"],
                    ["bookings", "Bookings", scoredAppointments.length, "border-gray-100 bg-white"],
                    ["reminders", "Reminders pending", reminderRows.pending.length, "border-amber-100 bg-amber-50/50"],
                    ["patients", "Patients", patients.length, "border-gray-100 bg-white"],
                  ] as const
                ).map(([id, label, count, cls]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSubTab(id)}
                    className={`rounded-xl border px-4 py-3 text-left hover:opacity-90 ${cls}`}
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-xl font-extrabold text-[#00283C] mt-1">{count}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Open →</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {subTab === "urgent" && (
            <section>
              {urgentQueue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400 text-sm">
                  No urgent appointments in this date range.
                </div>
              ) : (
                (() => {
                  const paged = paginate(urgentQueue, listPage);
                  return (
                    <div className="space-y-3">
                      {paged.slice.map((row) => (
                        <div
                          key={`urgent-${row.appointment.id}`}
                          className="rounded-xl border border-rose-100 bg-rose-50/50 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-[#00283C]">
                                {row.appointment.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatDate(row.appointment.createdAt)} ·{" "}
                                {channelLabel(row.appointment.source)}
                              </p>
                            </div>
                            <ScoreChip score={row.score} tier={row.tier} label={row.label} />
                          </div>
                          <p className="text-sm text-gray-700 mt-2">
                            {row.appointment.service || "—"} ·{" "}
                            {row.appointment.preferredTime || "time TBD"}
                          </p>
                          {(row.appointment.triageReason || row.appointment.notes) && (
                            <p className="text-sm text-rose-800 mt-2">
                              {row.appointment.triageReason || row.appointment.notes}
                            </p>
                          )}
                          <StatusButtons
                            appointmentId={row.appointment.id}
                            status={row.appointment.status}
                            busy={statusBusy === row.appointment.id}
                            onUpdate={updateStatus}
                          />
                        </div>
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
              )}
            </section>
          )}

          {subTab === "bookings" && (
            <section>
              {scoredAppointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400 text-sm">
                  No Maya appointments in this date range.
                </div>
              ) : (
                (() => {
                  const paged = paginate(scoredAppointments, listPage);
                  return (
                    <div className="space-y-3">
                      {paged.slice.map((row) => (
                        <BookingCard
                          key={row.appointment.id}
                          row={row}
                          busyId={statusBusy}
                          onStatus={updateStatus}
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
              )}
            </section>
          )}

          {subTab === "reminders" && (
            <section className="space-y-6">
              <div className="grid sm:grid-cols-4 gap-3">
                <StatCard label="24h sent" value={reminderRows.sent24.length} />
                <StatCard label="1h sent" value={reminderRows.sent1.length} />
                <StatCard label="Pending" value={reminderRows.pending.length} hint="Has email, none sent" />
                <StatCard label="No email" value={reminderRows.noEmail.length} hint="Cannot remind" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#00283C] mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  Pending reminders ({reminderRows.pending.length})
                </h3>
                {reminderRows.pending.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-400 text-sm">
                    No pending reminder flags in this range.
                  </div>
                ) : (
                  (() => {
                    const paged = paginate(reminderRows.pending, listPage);
                    return (
                      <div className="space-y-3">
                        {paged.slice.map((a) => (
                          <div
                            key={a.id}
                            className="rounded-xl border border-amber-100 bg-amber-50/40 p-4"
                          >
                            <p className="font-bold text-[#00283C]">{a.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDate(a.createdAt)} · {a.preferredTime || "—"} · {a.email}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              {a.service || "—"} · {channelLabel(a.source)}
                            </p>
                          </div>
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
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#00283C] mb-3">
                  Reminder sent ({reminderRows.sent24.length + reminderRows.sent1.length})
                </h3>
                <div className="space-y-2">
                  {[...reminderRows.sent24, ...reminderRows.sent1]
                    .filter(
                      (a, i, arr) => arr.findIndex((x) => x.id === a.id) === i
                    )
                    .map((a) => (
                      <div
                        key={`sent-${a.id}`}
                        className="rounded-xl border border-gray-100 bg-white px-4 py-3 flex flex-wrap justify-between gap-2"
                      >
                        <div>
                          <p className="font-semibold text-[#00283C] text-sm">
                            {a.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {a.service} · {a.preferredTime || "—"}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 self-center">
                          {[a.reminder24hSent ? "24h" : null, a.reminder1hSent ? "1h" : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}

          {subTab === "patients" && (
            <section>
              {patients.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400 text-sm">
                  No patient memory docs yet.
                </div>
              ) : (
                (() => {
                  const paged = paginate(patients, listPage);
                  return (
                    <div className="space-y-3">
                      {paged.slice.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-wrap justify-between gap-2">
                            <div>
                              <p className="font-bold text-[#00283C]">{p.name || "Unknown"}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {p.phone || "—"} · visits {p.visitCount ?? 0}
                                {p.lastService ? ` · last: ${p.lastService}` : ""}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400">{formatDate(p.updatedAt)}</p>
                          </div>
                          {p.preferences?.notes || p.preferences?.language ? (
                            <p className="text-sm text-gray-600 mt-2">
                              Prefs:{" "}
                              {[p.preferences.language, p.preferences.tone, p.preferences.notes]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          ) : null}
                          {p.pendingQuestions && p.pendingQuestions.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              Pending Qs:{" "}
                              {p.pendingQuestions
                                .map((q) => q.text)
                                .filter(Boolean)
                                .slice(0, 4)
                                .join(" · ")}
                            </p>
                          )}
                          {p.preVisitNotes && (
                            <p className="text-sm text-gray-600 mt-2">
                              Pre-visit: {p.preVisitNotes}
                            </p>
                          )}
                        </div>
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
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export { isMayaLeadSource };
