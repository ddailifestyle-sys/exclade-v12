import type { EventDay } from "@/data/eventCatalog";

/** Symposium dates confirmed by the organising team (IST). */
export const eventDates: Record<EventDay, { iso: string; label: string; short: string }> = {
  1: { iso: "2026-09-25T09:30:00+05:30", label: "FRIDAY, 25 SEPTEMBER 2026", short: "25 SEP 2026" },
  2: { iso: "2026-09-26T09:30:00+05:30", label: "SATURDAY, 26 SEPTEMBER 2026", short: "26 SEP 2026" },
};

/** Gates open at the start of Day 1. */
export const eventStartIso = eventDates[1].iso;

export const eventDateRangeLabel = "25 – 26 SEPTEMBER 2026";
