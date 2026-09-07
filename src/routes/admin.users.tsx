import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Trash2, UserPlus } from "lucide-react";

import { adminSession, createAdminUser, deleteAdminUser, listAdminUsers } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management | EXCLADE 2K26 Organiser" },
      { name: "description", content: "Private organiser user management for EXCLADE 2K26." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUsersPage,
});

type AdminUser = { id: string; username: string; label: string | null; createdAt: string };

function AdminUsersPage() {
  const navigate = useNavigate();
  const session = useServerFn(adminSession);
  const fetchUsers = useServerFn(listAdminUsers);
  const addUser = useServerFn(createAdminUser);
  const removeUser = useServerFn(deleteAdminUser);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setUsers(await fetchUsers());
    } catch {
      setError("COULD NOT LOAD USERS");
    }
  }, [fetchUsers]);

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

  const onCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice("");
    setError("");
    setBusy(true);
    try {
      const result = await addUser({ data: { username, password, label } });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setNotice(result.message);
      setUsername("");
      setPassword("");
      setLabel("");
      await load();
    } catch {
      setError("COULD NOT CREATE THE USER");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    setNotice("");
    setError("");
    const result = await removeUser({ data: { id } });
    if (!result.ok) setError(result.message);
    else setNotice(result.message);
    await load();
  };

  return (
    <section className="admin-page" aria-labelledby="admin-users-title">
      <div className="admin-inner">
        <header className="admin-head">
          <div>
            <p className="eyebrow">ORGANISER CONSOLE</p>
            <h1 id="admin-users-title">USER MANAGEMENT</h1>
          </div>
          <Link className="secondary-cta" to="/admin/dashboard">
            <ArrowLeft aria-hidden="true" size={12} /> REGISTRATIONS
          </Link>
        </header>

        <form className="admin-card admin-card-inline" onSubmit={onCreate}>
          <h2><UserPlus aria-hidden="true" size={14} /> CREATE A NEW USER</h2>

          <label className="admin-label" htmlFor="new-username">USERNAME</label>
          <input
            id="new-username"
            className="admin-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="admin-label" htmlFor="new-password">PASSWORD (MIN 8 CHARACTERS)</label>
          <input
            id="new-password"
            className="admin-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="admin-label" htmlFor="new-label">NAME / ROLE (OPTIONAL)</label>
          <input
            id="new-label"
            className="admin-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          {error && <p className="register-error" role="alert">{error}</p>}
          {notice && <p className="admin-notice" role="status">{notice}</p>}

          <button type="submit" className="primary-cta" disabled={busy}>
            {busy ? "CREATING…" : "CREATE USER"} <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="admin-rows">
          {users.map((user) => (
            <article className="admin-row" key={user.id}>
              <div className="admin-row-main">
                <h2>{user.username}</h2>
                <p className="admin-muted">
                  {user.label ?? "ORGANISER"} · ADDED {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="admin-row-side">
                <button type="button" className="secondary-cta" onClick={() => void onDelete(user.id)}>
                  <Trash2 aria-hidden="true" size={12} /> REMOVE
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
