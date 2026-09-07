import { createFileRoute, Link } from "@tanstack/react-router";

import { ChaosZone } from "@/components/ChaosZone";
import { TechnicalOperations } from "@/components/TechnicalOperations";
import { eventDateRangeLabel } from "@/data/eventDates";

const title = "Events | EXCLADE 2K26 Technical & Non-Technical";
const description =
  "Every EXCLADE 2K26 event: technical operations for builders and coders, plus the Chaos Zone of non-technical challenges.";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <>
      <TechnicalOperations />
      <ChaosZone />
      <section className="reginfo-cta" aria-label="Full schedule">
        <p>{eventDateRangeLabel} — see every event with its venue, timing and team size.</p>
        <div className="reginfo-cta-actions">
          <Link className="primary-cta" to="/schedule">VIEW FULL SCHEDULE <span aria-hidden="true">→</span></Link>
          <Link className="secondary-cta" to="/registration">[ HOW TO REGISTER ]</Link>
        </div>
      </section>
    </>
  );
}
