import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lock, MailCheck, Terminal, Upload } from "lucide-react";

import { PaymentQrPanel } from "@/components/PaymentQrPanel";
import {
  catalogEvents,
  daysFor,
  eventsByDay,
  findEvent,
  maxTeamSizeFor,
  type EventDay,
} from "@/data/eventCatalog";
import { qrForDay, readClicks, recordClick, type PaymentQr } from "@/lib/paymentQr";
import { submitRegistration } from "@/lib/registration";

type Fields = {
  fullName: string;
  college: string;
  department: string;
  year: string;
  email: string;
  phone: string;
};

const emptyFields: Fields = { fullName: "", college: "", department: "", year: "", email: "", phone: "" };

const labels: Record<keyof Fields, string> = {
  fullName: "FULL NAME",
  college: "COLLEGE / INSTITUTION",
  department: "DEPARTMENT",
  year: "YEAR",
  email: "EMAIL",
  phone: "PHONE NUMBER",
};

const years = ["I", "II", "III", "IV"];

type ErrorKey = keyof Fields | "events" | "teamName" | "screenshot";

type Step = 1 | 2 | 3 | 4;

const steps: { id: Step; label: string }[] = [
  { id: 1, label: "CHOOSE EVENTS" },
  { id: 2, label: "TEAM DETAILS" },
  { id: 3, label: "PAYMENT" },
  { id: 4, label: "DONE" },
];

export function RegistrationSection() {
  const [step, setStep] = useState<Step>(1);
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [selected, setSelected] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [clicksByDay, setClicksByDay] = useState<Record<EventDay, number>>({ 1: 0, 2: 0 });

  useEffect(() => {
    setClicksByDay({ 1: readClicks(1), 2: readClicks(2) });
  }, []);

  const days = useMemo(() => daysFor(selected), [selected]);
  const maxTeam = useMemo(() => maxTeamSizeFor(selected), [selected]);
  const selectedEvents = useMemo(
    () => selected.map((id) => findEvent(id)).filter((e): e is NonNullable<typeof e> => Boolean(e)),
    [selected],
  );
  const primaryDay: EventDay = days[0] ?? 1;

  const activeQrs: { day: EventDay; qr: PaymentQr; clicks: number }[] = days.map((day) => ({
    day,
    qr: qrForDay(day, clicksByDay[day]),
    clicks: clicksByDay[day],
  }));

  const clearError = (key: ErrorKey) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const setField = (key: keyof Fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const toggleEvent = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));
    clearError("events");
  };

  const setMember = (index: number, value: string) => {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const goToDetails = () => {
    if (selected.length === 0) {
      setErrors({ events: "SELECT AT LEAST ONE EVENT" });
      return;
    }
    setMembers((prev) => prev.slice(0, Math.max(0, maxTeamSizeFor(selected) - 1)));
    setStep(2);
  };

  const goToPayment = () => {
    const next: Partial<Record<ErrorKey, string>> = {};
    (Object.keys(labels) as (keyof Fields)[]).forEach((key) => {
      if (!fields[key].trim()) next[key] = "FIELD REQUIRED";
    });
    if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
      next.email = "ENTER A VALID EMAIL";
    }
    if (fields.phone.trim() && !/^[+]?[\d][\d\s-]{7,14}$/.test(fields.phone.trim())) {
      next.phone = "ENTER A VALID PHONE NUMBER";
    }
    const filledMembers = members.filter((m) => m.trim());
    if (maxTeam > 1 && filledMembers.length > 0 && !teamName.trim()) {
      next.teamName = "TEAM NAME REQUIRED";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStep(3);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!screenshot) {
      setErrors({ screenshot: "UPLOAD YOUR PAYMENT SCREENSHOT" });
      return;
    }
    const channel = activeQrs[0];
    if (!channel) return;
    setBusy(true);
    const result = await submitRegistration({
      ...fields,
      events: selectedEvents.map((e) => e.name),
      eventDay: primaryDay,
      teamName,
      teamMembers: members.filter((m) => m.trim()).map((name) => ({ name: name.trim() })),
      paymentHolder: channel.qr.holder,
      paymentUpiId: channel.qr.upiId,
      screenshot,
    });
    setBusy(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    setClicksByDay((prev) => {
      const updated = { ...prev };
      days.forEach((day) => {
        updated[day] = recordClick(day);
      });
      return updated;
    });
    setStep(4);
  };

  const reset = () => {
    setFields(emptyFields);
    setSelected([]);
    setTeamName("");
    setMembers([]);
    setScreenshot(null);
    setErrors({});
    setFormError("");
    setStep(1);
  };

  return (
    <section id="register" className="register-section" aria-labelledby="register-title">
      <div className="register-grid-bg" aria-hidden="true" />
      <div className="register-inner">
        <div className="lab-heading reveal-on-scroll">
          <div>
            <p className="eyebrow">REGISTRATION</p>
            <h2 id="register-title">REGISTRATION TERMINAL</h2>
            <p className="register-subtitle">CHOOSE EVENTS → TEAM DETAILS → PAY → UPLOAD PROOF</p>
          </div>
          <span className="file-count"><Lock aria-hidden="true" size={12} /> EXCLADE 2K26 // SECURE ACCESS</span>
        </div>

        <div className="terminal-shell reveal-on-scroll">
          <div className="terminal-bar">
            <span><Terminal aria-hidden="true" size={13} /> REGISTRATION TERMINAL</span>
            <span>{step === 4 ? "SESSION COMPLETE" : `STEP ${step} / 3`}</span>
          </div>

          <ol className="register-steps" aria-label="Registration progress">
            {steps.map((s) => (
              <li key={s.id} className={s.id === step ? "is-current" : s.id < step ? "is-done" : ""}>
                <span aria-hidden="true">{s.id < step ? "✓" : s.id}</span>
                {s.label}
              </li>
            ))}
          </ol>

          {step === 1 && (
            <div className="register-form">
              <fieldset className="register-fieldset">
                <legend>STEP 1 — SELECT YOUR EVENTS</legend>
                <p className="register-hint">
                  Pick one or more events. Team size and the payment channel are decided by your choices.
                </p>

                {([1, 2] as EventDay[]).map((day) => (
                  <div key={day}>
                    <p className={`register-group-label${day === 2 ? " register-group-label-chaos" : ""}`}>
                      DAY {day}
                    </p>
                    <div className="event-selector">
                      {eventsByDay(day).map((event) => (
                        <label
                          className={`event-option${event.category === "NON-TECHNICAL" ? " event-option-chaos" : ""}${selected.includes(event.id) ? " event-option-active" : ""}`}
                          key={event.id}
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(event.id)}
                            onChange={() => toggleEvent(event.id)}
                          />
                          <span className="event-option-box" aria-hidden="true" />
                          <span className="event-option-name">
                            {event.name}
                            <small>
                              {event.venue} · {event.time} ·{" "}
                              {event.maxTeam === 1 ? "SOLO" : `TEAM OF ${event.minTeam}–${event.maxTeam}`}
                            </small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {errors.events && <span className="register-error" role="alert">{errors.events}</span>}
              </fieldset>

              <div className="register-submit-row">
                <p className="register-demo-note">
                  {selected.length > 0
                    ? `${selected.length} event(s) selected · Day ${days.join(" & ")}`
                    : "No events selected yet."}
                </p>
                <button type="button" className="primary-cta" onClick={goToDetails}>
                  CONTINUE <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="register-form">
              <fieldset className="register-fieldset">
                <legend>STEP 2 — PARTICIPANT DETAILS</legend>
                <div className="register-fields">
                  {(Object.keys(labels) as (keyof Fields)[]).map((key) => (
                    <div
                      className={`register-field${errors[key] ? " register-field-error" : ""}${fields[key].trim() && !errors[key] ? " register-field-ok" : ""}`}
                      key={key}
                    >
                      <label htmlFor={`reg-${key}`}>{labels[key]}</label>
                      {key === "year" ? (
                        <select
                          id="reg-year"
                          value={fields.year}
                          onChange={(e) => setField("year", e.target.value)}
                          aria-invalid={Boolean(errors.year)}
                        >
                          <option value="">SELECT YEAR</option>
                          {years.map((y) => <option key={y} value={y}>{y} YEAR</option>)}
                        </select>
                      ) : (
                        <input
                          id={`reg-${key}`}
                          type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                          value={fields[key]}
                          onChange={(e) => setField(key, e.target.value)}
                          aria-invalid={Boolean(errors[key])}
                          autoComplete={key === "fullName" ? "name" : key === "email" ? "email" : key === "phone" ? "tel" : "off"}
                        />
                      )}
                      {errors[key] && <span className="register-error">{errors[key]}</span>}
                    </div>
                  ))}
                </div>
              </fieldset>

              {maxTeam > 1 ? (
                <fieldset className="register-fieldset">
                  <legend>TEAM DETAILS</legend>
                  <p className="register-hint">
                    Your selection allows a team of up to {maxTeam}. You are member 1 — add your teammates below
                    (leave blank if you are competing solo).
                  </p>
                  <div className="register-fields">
                    <div className={`register-field${errors.teamName ? " register-field-error" : ""}`}>
                      <label htmlFor="reg-team-name">TEAM NAME</label>
                      <input
                        id="reg-team-name"
                        value={teamName}
                        onChange={(e) => { setTeamName(e.target.value); clearError("teamName"); }}
                      />
                      {errors.teamName && <span className="register-error">{errors.teamName}</span>}
                    </div>
                    {Array.from({ length: maxTeam - 1 }).map((_, i) => (
                      <div className="register-field" key={i}>
                        <label htmlFor={`reg-member-${i}`}>MEMBER {i + 2} NAME (OPTIONAL)</label>
                        <input
                          id={`reg-member-${i}`}
                          value={members[i] ?? ""}
                          onChange={(e) => setMember(i, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <fieldset className="register-fieldset">
                  <legend>TEAM DETAILS</legend>
                  <p className="register-hint">All your selected events are solo — no teammates needed.</p>
                </fieldset>
              )}

              <div className="register-submit-row">
                <button type="button" className="secondary-cta" onClick={() => setStep(1)}>[ BACK ]</button>
                <button type="button" className="primary-cta" onClick={goToPayment}>
                  CONTINUE TO PAYMENT <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form className="register-form" onSubmit={onSubmit} noValidate>
              <fieldset className="register-fieldset">
                <legend>STEP 3 — PAY THE REGISTRATION FEE</legend>
                <p className="register-hint">
                  Pay using the channel below for your selected day{days.length > 1 ? "s" : ""}, then upload the
                  payment screenshot.
                </p>
                <div className="payment-qr-row">
                  {activeQrs.map((entry) => (
                    <PaymentQrPanel key={entry.day} qr={entry.qr} clicks={entry.clicks} day={entry.day} />
                  ))}
                </div>
              </fieldset>

              <fieldset className="register-fieldset">
                <legend>UPLOAD PAYMENT SCREENSHOT</legend>
                <div className={`register-field${errors.screenshot ? " register-field-error" : ""}`}>
                  <label htmlFor="reg-screenshot">
                    <Upload aria-hidden="true" size={12} /> PAYMENT SCREENSHOT (IMAGE, MAX 5 MB)
                  </label>
                  <input
                    id="reg-screenshot"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setScreenshot(e.target.files?.[0] ?? null);
                      clearError("screenshot");
                    }}
                  />
                  {screenshot && <span className="register-hint">SELECTED: {screenshot.name}</span>}
                  {errors.screenshot && <span className="register-error">{errors.screenshot}</span>}
                </div>
              </fieldset>

              {formError && <p className="register-error" role="alert">{formError}</p>}

              <div className="register-submit-row">
                <button type="button" className="secondary-cta" onClick={() => setStep(2)}>[ BACK ]</button>
                <button type="submit" className="primary-cta" disabled={busy}>
                  {busy ? "SUBMITTING…" : "SUBMIT REGISTRATION"} <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="register-success" role="status" aria-live="polite">
              <span className="register-success-mark" aria-hidden="true"><CheckCircle2 size={30} strokeWidth={1.4} /></span>
              <p className="register-success-kicker">REGISTRATION RECEIVED</p>
              <h3>ACCESS GRANTED</h3>
              <p className="register-success-welcome">WELCOME TO<br /><b>EXCLADE 2K26</b></p>
              <dl className="file-facts">
                <div><dt>PARTICIPANT</dt><dd>{fields.fullName}</dd></div>
                {teamName && <div><dt>TEAM</dt><dd>{teamName}</dd></div>}
                <div><dt>EVENTS</dt><dd>{selectedEvents.map((e) => e.name).join(" · ")}</dd></div>
                <div><dt>DAY</dt><dd>{days.join(" & ")}</dd></div>
              </dl>
              <p className="register-success-line">
                <MailCheck aria-hidden="true" size={14} /> OUR TEAM WILL CONTACT YOU SOON.
              </p>
              <p className="register-demo-note">
                A confirmation e-mail will be sent to <b>{fields.email}</b> — please keep an eye on your recent
                e-mails (including the spam folder).
              </p>
              <button type="button" className="secondary-cta" onClick={reset}>[ NEW ENTRY ]</button>
            </div>
          )}
        </div>
      </div>

      <Link className="sticky-register-cta" to="/register">REGISTER NOW</Link>
    </section>
  );
}

export const registrationEventCount = catalogEvents.length;
