import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, Users } from "lucide-react";

import { catalogEvents, eventsByDay, type EventDay } from "@/data/eventCatalog";
import { eventDates, eventDateRangeLabel } from "@/data/eventDates";

const title = "Schedule | EXCLADE 2K26 Day 1 & Day 2 Timings";
const description =
  "The full EXCLADE 2K26 schedule: every event across 25 and 26 September 2026 with venue, timing and team size at KSR College of Engineering.";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  return (
    <section className="schedule-page" aria-labelledby="schedule-title">
      <div className="schedule-inner">
        <div className="lab-heading">
          <div>
            <p className="eyebrow">MASTER SCHEDULE</p>
            <h2 id="schedule-title">EXCLADE 2K26 TIMETABLE</h2>
            <p className="register-subtitle">{eventDateRangeLabel} · {catalogEvents.length} EVENTS · 2 DAYS</p>
          </div>
          <Link className="secondary-cta" to="/register">[ REGISTER ]</Link>
        </div>

        {([1, 2] as EventDay[]).map((day) => (
          <div className="schedule-day" key={day}>
            <header className="schedule-day-head">
              <h3>DAY {day}</h3>
              <span>{eventDates[day].label}</span>
            </header>

            <ol className="schedule-list">
              {eventsByDay(day).map((event) => (
                <li key={event.id}>
                  <div className="schedule-time"><Clock aria-hidden="true" size={12} /> {event.time}</div>
                  <div className="schedule-body">
                    <h4>{event.name}</h4>
                    <p>
                      <span><MapPin aria-hidden="true" size={12} /> {event.venue}</span>
                      <span>
                        <Users aria-hidden="true" size={12} />{" "}
                        {event.maxTeam === 1 ? "SOLO ENTRY" : `TEAM OF ${event.minTeam}–${event.maxTeam}`}
                      </span>
                      <span className="schedule-tag">{event.category}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}

        <p className="register-demo-note">
          Report to your venue 15 minutes before the listed start time. Timings can shift slightly on the day —
          the event desk at Edison Hall has the final call.
        </p>
      </div>
    </section>
  );
}
