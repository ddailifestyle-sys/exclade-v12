import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck, CreditCard, ListChecks, MailCheck, UserPlus } from "lucide-react";

import { catalogEvents } from "@/data/eventCatalog";
import { eventDateRangeLabel } from "@/data/eventDates";

const title = "How to Register | EXCLADE 2K26 Registration Guide";
const description =
  "Everything you need before registering for EXCLADE 2K26: the step-by-step timeline, payment instructions, team rules and answers to the most asked questions.";

export const Route = createFileRoute("/registration")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RegistrationInfoPage,
});

const timeline = [
  {
    icon: ListChecks,
    title: "PICK ONE EVENT",
    body: "Browse the Day 1 and Day 2 lists and select the single event you want to compete in. Team size is set by that event.",
  },
  {
    icon: UserPlus,
    title: "ENTER YOUR DETAILS",
    body: "Name, college, department, year, e-mail and phone. Team events also ask for a team name and your teammates.",
  },
  {
    icon: CreditCard,
    title: "PAY THE FEE",
    body: "Scan the UPI code shown for your event day and pay the registration fee from any UPI app.",
  },
  {
    icon: ClipboardCheck,
    title: "UPLOAD THE PROOF",
    body: "Attach a screenshot of the successful payment (image, under 5 MB) and submit the form.",
  },
  {
    icon: MailCheck,
    title: "WAIT FOR CONFIRMATION",
    body: "Your entry is saved instantly. Our team verifies the payment and contacts you with the final event details.",
  },
];

const faqs = [
  {
    q: "Can I register for more than one event?",
    a: "One event per registration. If you want a second event, submit the form again with that event selected.",
  },
  {
    q: "Who can participate?",
    a: "Students from any college and any department can take part. Carry your college ID card on the event day.",
  },
  {
    q: "How do I know my registration went through?",
    a: "You will see an ACCESS GRANTED confirmation screen right after submitting. Our team then reaches out with the details before the event.",
  },
  {
    q: "What if my payment screenshot is unclear?",
    a: "Our team will contact you on the phone number you entered and ask for a clearer screenshot, so please use a reachable number.",
  },
  {
    q: "Can my team members be from different colleges?",
    a: "Yes. Only the team lead fills the form; list every teammate's name in the team section.",
  },
  {
    q: "Is there a deadline?",
    a: `Registrations stay open until the slots for each event are filled, and close on the event day itself (${eventDateRangeLabel}).`,
  },
];

function RegistrationInfoPage() {
  return (
    <section className="reginfo-page" aria-labelledby="reginfo-title">
      <div className="reginfo-inner">
        <div className="lab-heading">
          <div>
            <p className="eyebrow">REGISTRATION BRIEFING</p>
            <h2 id="reginfo-title">HOW TO JOIN EXCLADE 2K26</h2>
            <p className="register-subtitle">
              {catalogEvents.length} EVENTS · {eventDateRangeLabel} · KSR COLLEGE OF ENGINEERING
            </p>
          </div>
          <Link className="primary-cta" to="/register">OPEN THE FORM <span aria-hidden="true">→</span></Link>
        </div>

        <ol className="reginfo-timeline">
          {timeline.map((step, index) => (
            <li key={step.title}>
              <span className="reginfo-step-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3><step.icon aria-hidden="true" size={14} /> {step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="reginfo-faq">
          <h3>FREQUENTLY ASKED</h3>
          <dl>
            {faqs.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="reginfo-cta">
          <p>Ready? The registration terminal takes about two minutes.</p>
          <div className="reginfo-cta-actions">
            <Link className="primary-cta" to="/register">REGISTER NOW <span aria-hidden="true">→</span></Link>
            <Link className="secondary-cta" to="/schedule">[ VIEW SCHEDULE ]</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
