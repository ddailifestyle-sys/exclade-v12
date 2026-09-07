import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

const SALT = "exclade2k26";

type AdminSession = { username?: string };

function sessionConfig() {
  return {
    password: process.env["ADMIN_SESSION_SECRET"]!,
    name: "exclade-admin",
    maxAge: 60 * 60 * 8,
    // "none" + secure so the session survives inside the embedded preview frame,
    // which is a cross-site context where a "lax" cookie is never sent back.
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
  };
}

function hashPassword(password: string) {
  return createHash("sha256").update(SALT + password, "utf8").digest("hex");
}

function hashesMatch(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function currentUsername() {
  const session = await useSession<AdminSession>(sessionConfig());
  return session.data.username ?? null;
}

async function requireAdmin() {
  const username = await currentUsername();
  if (!username) throw new Error("NOT_AUTHORISED");
  return username;
}

export const adminSession = createServerFn({ method: "GET" }).handler(async () => ({
  username: await currentUsername(),
}));

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => ({
    username: String(data.username ?? "").trim().slice(0, 120),
    password: String(data.password ?? "").slice(0, 200),
  }))
  .handler(async ({ data }) => {
    if (!data.username || !data.password) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("admin_users")
      .select("username, password_hash")
      .eq("username", data.username)
      .maybeSingle();

    if (!row || !hashesMatch(row.password_hash, hashPassword(data.password))) {
      return { ok: false as const };
    }

    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ username: row.username });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export type AdminRegistration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  teamName: string | null;
  teamMembers: { name?: string }[];
  events: string[];
  eventDay: number | null;
  paymentHolder: string | null;
  paymentUpiId: string | null;
  screenshotUrl: string | null;
  status: string;
  confirmedAt: string | null;
  detailsSentAt: string | null;
  createdAt: string;
};

export const listRegistrations = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const result: AdminRegistration[] = [];
  for (const row of rows) {
    let screenshotUrl: string | null = null;
    if (row.payment_screenshot_path) {
      const signed = await supabaseAdmin.storage
        .from("payment-proofs")
        .createSignedUrl(row.payment_screenshot_path, 60 * 60);
      screenshotUrl = signed.data?.signedUrl ?? null;
    }
    result.push({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      college: row.college,
      department: row.department,
      year: row.year,
      teamName: row.team_name,
      teamMembers: Array.isArray(row.team_members) ? (row.team_members as { name?: string }[]) : [],
      events: row.events ?? [],
      eventDay: row.event_day,
      paymentHolder: row.payment_holder,
      paymentUpiId: row.payment_upi_id,
      screenshotUrl,
      status: row.status,
      confirmedAt: row.confirmed_at ?? null,
      detailsSentAt: row.details_sent_at ?? null,
      createdAt: row.created_at,
    });
  }
  return result;
});

export const setRegistrationStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; status: "pending" | "confirmed" | "rejected" }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("registrations")
      .update({
        status: data.status,
        confirmed_at: data.status === "confirmed" ? new Date().toISOString() : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const markDetailsSent = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("registrations")
      .update({ details_sent_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listAdminUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, username, label, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    username: row.username,
    label: row.label,
    createdAt: row.created_at,
  }));
});

export const createAdminUser = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string; label: string }) => ({
    username: String(data.username ?? "").trim().slice(0, 120),
    password: String(data.password ?? "").slice(0, 200),
    label: String(data.label ?? "").trim().slice(0, 120),
  }))
  .handler(async ({ data }) => {
    await requireAdmin();
    if (data.username.length < 4) return { ok: false as const, message: "USERNAME MUST BE AT LEAST 4 CHARACTERS" };
    if (data.password.length < 8) return { ok: false as const, message: "PASSWORD MUST BE AT LEAST 8 CHARACTERS" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("admin_users").insert({
      username: data.username,
      password_hash: hashPassword(data.password),
      label: data.label || null,
    });
    if (error) {
      return {
        ok: false as const,
        message: error.code === "23505" ? "THAT USERNAME ALREADY EXISTS" : "COULD NOT CREATE THE USER",
      };
    }
    return { ok: true as const, message: "USER CREATED" };
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const me = await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("admin_users")
      .select("username")
      .eq("id", data.id)
      .maybeSingle();
    if (!row || row.username === me) return { ok: false as const, message: "YOU CANNOT REMOVE YOUR OWN ACCOUNT" };
    const { error } = await supabaseAdmin.from("admin_users").delete().eq("id", data.id);
    if (error) return { ok: false as const, message: "COULD NOT REMOVE THE USER" };
    return { ok: true as const, message: "USER REMOVED" };
  });
