import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, ClipboardCheck, IdCard, Laptop, Phone, Utensils } from "lucide-react";

const contacts = [
  { name: "SANTHOSH G", phone: "8870355924", role: "GENERAL ENQUIRIES" },
  { name: "VINISHKA G", phone: "7358870976", role: "EVENT COORDINATION" },
  { name: "DHAYALAN B", phone: "9486578478", role: "REGISTRATION SUPPORT" },
  { name: "MAHBUBA YASMIN LASKAR", phone: "7010956920", role: "PARTICIPANT SUPPORT" },
] as const;

const essentials = [
  {
    icon: IdCard,
    title: "CARRY YOUR COLLEGE ID",
    detail: "A valid college ID is required for every participant.",
  },
  {
    icon: ClipboardCheck,
    title: "REGISTER INDIVIDUALLY",
    detail: "Group registrations are not accepted.",
  },
  {
    icon: Laptop,
    title: "BRING YOUR KIT",
    detail: "Carry stationery, a laptop, or materials required for your event.",
  },
  {
    icon: Utensils,
    title: "KNOW THE MEAL PLAN",
    detail:
      "Lunch is for paper presentation and workshop participants, plus anyone registered for at least four events. Refreshments are for everyone.",
  },
] as const;

const rules = [
  "Fees are strictly non-refundable once paid.",
  "Certificates are issued only to participants who attend and take part.",
  "Report to the venue on time according to the schedule.",
  "Judges' and organizers' decisions are final and binding.",
  "Maintain discipline and proper conduct throughout the symposium.",
] as const;

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[var(--ink-deep)] px-5 py-24 text-[var(--sand)] sm:px-8 lg:px-12"
      aria-labelledby="contact-title"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(color-mix(in_oklab,var(--sand)_10%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--sand)_10%,transparent)_1px,transparent_1px)] [background-size:64px_64px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col justify-between gap-6 border-b border-[var(--line)] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold tracking-[.28em] text-[var(--amber)]">
              EXCLADE ASSOCIATION / COMMUNICATION DESK
            </p>
            <h2
              id="contact-title"
              className="font-['Syne'] text-5xl font-extrabold leading-[.9] tracking-[-.06em] sm:text-7xl"
            >
              REACH THE
              <br />
              <span className="text-[var(--amber)]">EXCLADE CREW.</span>
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--sand-muted)] sm:text-lg">
              From paper presentations and tech challenges to fun non-tech events, EXCLADE is your
              stage to explore ideas, solve problems, and make memories beyond the classroom.
            </p>
          </div>
          <span className="text-xs tracking-[.2em] text-[var(--sand-muted)]">
            EXCLADE 2K26 / LIVE SUPPORT
          </span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs tracking-[.22em] text-[var(--amber)]">DIRECT CONTACTS</p>
              <span className="h-px flex-1 bg-[var(--line)] ml-4" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {contacts.map((contact, index) => (
                <a
                  key={contact.phone}
                  href={`tel:${contact.phone}`}
                  className="group border border-[var(--line)] bg-[color-mix(in_oklab,var(--ink-panel)_72%,transparent)] p-5 transition-colors hover:border-[var(--amber)] hover:bg-[color-mix(in_oklab,var(--amber)_9%,var(--ink-panel))]"
                >
                  <div className="mb-8 flex items-start justify-between">
                    <span className="text-xs text-[var(--sand-muted)]">
                      0{index + 1} / {contact.role}
                    </span>
                    <Phone size={18} className="text-[var(--amber)]" />
                  </div>
                  <h3 className="font-['Syne'] text-xl font-bold tracking-[-.03em]">
                    {contact.name}
                  </h3>
                  <p className="mt-2 text-lg tracking-[.08em] text-[var(--amber)]">
                    {contact.phone}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[10px] tracking-[.2em] text-[var(--sand-muted)] group-hover:text-[var(--sand)]">
                    CALL COORDINATOR <ArrowUpRight size={13} />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs tracking-[.22em] text-[var(--amber)]">PARTICIPANT CHECKLIST</p>
              <span className="h-px flex-1 bg-[var(--line)] ml-4" />
            </div>
            <div className="space-y-3">
              {essentials.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="flex gap-4 border-b border-[var(--line)] py-3">
                  <Icon className="mt-1 shrink-0 text-[var(--lime)]" size={19} />
                  <div>
                    <h3 className="text-xs font-bold tracking-[.12em]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--sand-muted)]">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 border-t border-[var(--line)] pt-10 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="text-xs tracking-[.22em] text-[var(--amber)]">BEFORE YOU ARRIVE</p>
            <h3 className="mt-4 font-['Syne'] text-3xl font-bold tracking-[-.04em]">
              READ THE
              <br />
              FINE PRINT.
            </h3>
          </div>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {rules.map((rule) => (
              <li key={rule} className="flex gap-3 text-sm leading-6 text-[var(--sand-muted)]">
                <Check size={17} className="mt-1 shrink-0 text-[var(--amber)]" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border border-[var(--amber)] p-6 sm:p-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs tracking-[.22em] text-[var(--amber)]">READY TO TAKE THE STAGE?</p>
            <h3 className="mt-2 font-['Syne'] text-2xl font-bold">
              REGISTER INDIVIDUALLY. SHOW UP BRILLIANT.
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 bg-[var(--amber)] px-5 py-3 text-xs font-bold tracking-[.12em] text-[var(--ink)] transition-transform hover:-translate-y-1"
              to="/register"
            >
              REGISTER NOW <ArrowUpRight size={16} />
            </Link>
            <Link
              className="inline-flex items-center border border-[var(--line)] px-5 py-3 text-xs font-bold tracking-[.12em] text-[var(--sand)] hover:border-[var(--sand)]"
              to="/crew"
            >
              MEET THE CREW
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
