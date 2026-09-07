import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LogOut, Mail, RefreshCw, Users } from "lucide-react";

import { eventDates } from "@/data/eventDates";
import {
  adminLogout,
  adminSession,
  listRegistrations,
  markDetailsSent,
  setRegistrationStatus,
  type AdminRegistration,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Registrations | EXCLADE 2K26 Organiser" },
      { name: "description", content: "Private organiser view of EXCLADE 2K26 registrations." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

function detailsMail(row: AdminRegistration) {
  const day = row.eventDay === 2 ? eventDates[2] : eventDates[1];
  const subject = `EXCLADE 2K26 — Event details for ${row.events.join(", ")}`;
  const body = [
    `Hi ${row.fullName},`,
    "",
    `Your registration for EXCLADE 2K26 is confirmed.`,
    `Event: ${row.events.join(", ")}`,
    `Day: ${day.label}`,
    row.teamName ? `Team: ${row.teamName}` : "",
    "",
    "Please reach your venue 15 minutes before the start time and carry your college ID card.",
    "",
    "— Department of CSE (IoT), KSR College of Engineering",
  ]
    .filter(Boolean)
    .join("\n");
  return `mailto:${row.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const fetchRows = useServerFn(listRegistrations);
  const session = useServerFn(adminSession);
  const logout = useServerFn(adminLogout);
  const updateStatus = useServerFn(setRegistrationStatus);
  const sendDetails = useServerFn(markDetailsSent);

  const [rows, setRows] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchRows());
    } catch {
      setError("COULD NOT LOAD REGISTRATIONS");
    } finally {
      setLoading(false);
    }
  }, [fetchRows]);

  useEffect(() => {
    session()
      .then((res) => {
        if (!res.username) {
          navigate({ to: "/admin", replace: true });
          return;
        }
        void load();
      })
      .catch(() => navigate({ to: "/admin", replace: true }));
  }, [load, navigate, session]);

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => row.status === filter)),
    [filter, rows],
  );

  const counts = useMemo(
    () => ({
      total: rows.length,
      confirmed: rows.filter((r) => r.status === "confirmed").length,
      day1: rows.filter((r) => r.eventDay === 1).length,
      day2: rows.filter((r) => r.eventDay === 2).length,
    }),
    [rows],
  );

  const onConfirm = async (row: AdminRegistration) => {
    const next = row.status === "confirmed" ? "pending" : "confirmed";
    await updateStatus({ data: { id: row.id, status: next } });
    await load();
  };

  const onSent = async (row: AdminRegistration) => {
    await sendDetails({ data: { id: row.id } });
    await load();
  };

  const onLogout = async () => {
    await logout();
    navigate({ to: "/admin", replace: true });
  };

  return (
    <section className="admin-page" aria-labelledby="admin-dash-title">
      <div className="admin-inner">
        <header className="admin-head">
          <div>
            <p className="eyebrow">ORGANISER CONSOLE</p>
            <h1 id="admin-dash-title">REGISTRATIONS</h1>
          </div>
          <div className="admin-head-actions">
            <Link className="secondary-cta" to="/admin/users"><Users aria-hidden="true" size={12} /> USERS</Link>
            <button type="button" className="secondary-cta" onClick={() => void load()}>
              <RefreshCw aria-hidden="true" size={12} /> REFRESH
            </button>
            <button type="button" className="secondary-cta" onClick={() => void onLogout()}>
              <LogOut aria-hidden="true" size={12} /> SIGN OUT
            </button>
          </div>
        </header>

        <ul className="admin-stats">
          <li><b>{counts.total}</b><span>TOTAL</span></li>
          <li><b>{counts.confirmed}</b><span>CONFIRMED</span></li>
          <li><b>{counts.day1}</b><span>DAY 1</span></li>
          <li><b>{counts.day2}</b><span>DAY 2</span></li>
        </ul>

        <div className="admin-filters">
          {(["all", "pending", "confirmed"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={filter === key ? "admin-chip is-active" : "admin-chip"}
              onClick={() => setFilter(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>

        {error && <p className="register-error" role="alert">{error}</p>}
        {loading && <p className="admin-muted">LOADING…</p>}
        {!loading && visible.length === 0 && <p className="admin-muted">NO REGISTRATIONS YET.</p>}

        <div className="admin-rows">
          {visible.map((row) => (
            <article className="admin-row" key={row.id}>
              <div className="admin-row-main">
                <h2>{row.fullName}</h2>
                <p className="admin-muted">
                  {row.college} · {row.department} · YEAR {row.year}
                </p>
                <p className="admin-muted">{row.email} · {row.phone}</p>
                <p className="admin-row-event">
                  {row.events.join(", ") || "—"} · DAY {row.eventDay ?? "?"}
                  {row.teamName ? ` · TEAM ${row.teamName}` : ""}
                </p>
                {row.teamMembers.length > 0 && (
                  <p className="admin-muted">
                    MEMBERS: {row.teamMembers.map((m) => m.name).filter(Boolean).join(", ")}
                  </p>
                )}
                <p className="admin-muted">
                  PAID TO {row.paymentHolder ?? "—"} ({row.paymentUpiId ?? "—"}) ·{" "}
                  {new Date(row.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="admin-row-side">
                <span className={`admin-status admin-status-${row.status}`}>{row.status.toUpperCase()}</span>
                {row.screenshotUrl && (
                  <a className="admin-link" href={row.screenshotUrl} target="_blank" rel="noreferrer">
                    VIEW PAYMENT PROOF ↗
                  </a>
                )}
                <button type="button" className="secondary-cta" onClick={() => void onConfirm(row)}>
                  <CheckCircle2 aria-hidden="true" size={12} />{" "}
                  {row.status === "confirmed" ? "UNDO CONFIRM" : "CONFIRM ATTENDEE"}
                </button>
                <a className="secondary-cta" href={detailsMail(row)} onClick={() => void onSent(row)}>
                  <Mail aria-hidden="true" size={12} /> SEND EVENT DETAILS
                </a>
                {row.detailsSentAt && (
                  <span className="admin-muted">
                    DETAILS SENT {new Date(row.detailsSentAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
