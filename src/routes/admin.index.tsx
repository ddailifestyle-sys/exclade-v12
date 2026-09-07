import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { adminLogin, adminSession } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Organiser Access | EXCLADE 2K26" },
      { name: "description", content: "Private organiser access for the EXCLADE 2K26 team." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useServerFn(adminLogin);
  const session = useServerFn(adminSession);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    session().then((res) => {
      if (res.username) navigate({ to: "/admin/dashboard", replace: true });
    }).catch(() => undefined);
  }, [navigate, session]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await login({ data: { username, password } });
      if (!result.ok) {
        setError("INVALID USERNAME OR PASSWORD");
        return;
      }
      navigate({ to: "/admin/dashboard", replace: true });
    } catch {
      setError("LOGIN FAILED — PLEASE TRY AGAIN");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-page admin-page-narrow" aria-labelledby="admin-login-title">
      <form className="admin-card" onSubmit={onSubmit}>
        <p className="eyebrow"><Lock aria-hidden="true" size={12} /> RESTRICTED</p>
        <h1 id="admin-login-title">ORGANISER ACCESS</h1>
        <p className="admin-muted">EXCLADE 2K26 control terminal. Authorised crew only.</p>

        <label className="admin-label" htmlFor="admin-username">USERNAME</label>
        <input
          id="admin-username"
          className="admin-input"
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="admin-label" htmlFor="admin-password">PASSWORD</label>
        <input
          id="admin-password"
          className="admin-input"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="register-error" role="alert">{error}</p>}

        <button type="submit" className="primary-cta" disabled={busy}>
          {busy ? "VERIFYING…" : "UNLOCK"} <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  );
}
