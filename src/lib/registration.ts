import { supabase } from "@/integrations/supabase/client";
import type { EventDay } from "@/data/eventCatalog";

export type TeamMember = { name: string; email?: string; phone?: string };

export type RegistrationPayload = {
  fullName: string;
  college: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  events: string[];
  eventDay: EventDay;
  teamName?: string;
  teamMembers: TeamMember[];
  paymentHolder: string;
  paymentUpiId: string;
  screenshot: File;
};

export type RegistrationResult = { ok: boolean; message: string };

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

export async function submitRegistration(payload: RegistrationPayload): Promise<RegistrationResult> {
  const file = payload.screenshot;
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "PAYMENT PROOF MUST BE AN IMAGE FILE" };
  }
  if (file.size > MAX_SCREENSHOT_BYTES) {
    return { ok: false, message: "PAYMENT PROOF MUST BE UNDER 5 MB" };
  }

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `day-${payload.eventDay}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const upload = await supabase.storage.from("payment-proofs").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (upload.error) {
    return { ok: false, message: "PAYMENT PROOF UPLOAD FAILED — PLEASE TRY AGAIN" };
  }

  const insert = await supabase.from("registrations").insert({
    full_name: payload.fullName.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    college: payload.college.trim(),
    department: payload.department.trim(),
    year: payload.year,
    team_name: payload.teamName?.trim() || null,
    team_members: payload.teamMembers,
    events: payload.events,
    event_day: payload.eventDay,
    payment_holder: payload.paymentHolder,
    payment_upi_id: payload.paymentUpiId,
    payment_screenshot_path: path,
  });

  if (insert.error) {
    return { ok: false, message: "REGISTRATION COULD NOT BE SAVED — PLEASE TRY AGAIN" };
  }

  return { ok: true, message: "REGISTRATION RECEIVED" };
}
