import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

import { eventDateRangeLabel, eventStartIso } from "@/data/eventDates";

const target = new Date(eventStartIso).getTime();

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function partsFrom(ms: number): Parts {
  const clamped = Math.max(0, ms);
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped / 3_600_000) % 24),
    minutes: Math.floor((clamped / 60_000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CountdownStrip() {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(partsFrom(target - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const started = parts !== null && target - Date.now() <= 0;

  const cells: [string, string][] = parts
    ? [
        [String(parts.days), "DAYS"],
        [pad(parts.hours), "HOURS"],
        [pad(parts.minutes), "MINS"],
        [pad(parts.seconds), "SECS"],
      ]
    : [
        ["--", "DAYS"],
        ["--", "HOURS"],
        ["--", "MINS"],
        ["--", "SECS"],
      ];

  return (
    <section className="countdown-strip" aria-labelledby="countdown-title">
      <div className="countdown-inner">
        <div className="countdown-copy">
          <p className="eyebrow"><CalendarClock aria-hidden="true" size={12} /> {eventDateRangeLabel}</p>
          <h2 id="countdown-title">
            {started ? "EXCLADE 2K26 IS LIVE" : "COUNTDOWN TO EXCLADE 2K26"}
          </h2>
          <p className="countdown-sub">
            KSR COLLEGE OF ENGINEERING · DEPARTMENT OF CSE (IoT) · TWO DAYS, ELEVEN EVENTS
          </p>
        </div>

        <ol className="countdown-clock" aria-live="off">
          {cells.map(([value, label]) => (
            <li key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </li>
          ))}
        </ol>

        <div className="countdown-actions">
          <Link className="primary-cta" to="/register">REGISTER NOW <span aria-hidden="true">→</span></Link>
          <Link className="secondary-cta" to="/schedule">[ FULL SCHEDULE ]</Link>
        </div>
      </div>
    </section>
  );
}
