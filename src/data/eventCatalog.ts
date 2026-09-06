export type EventDay = 1 | 2;

export type CatalogEvent = {
  id: string;
  name: string;
  category: "TECHNICAL" | "NON-TECHNICAL";
  day: EventDay;
  venue: string;
  time: string;
  /** Minimum participants per entry. */
  minTeam: number;
  /** Maximum participants per entry (1 = solo). */
  maxTeam: number;
};

export const catalogEvents: CatalogEvent[] = [
  { id: "paper-presentation", name: "PAPER PRESENTATION", category: "TECHNICAL", day: 1, venue: "Edison Hall", time: "9:30 AM – 12:30 PM", minTeam: 1, maxTeam: 3 },
  { id: "iot-simulators", name: "IoT SIMULATORS", category: "TECHNICAL", day: 1, venue: "IoT Lab, 1st Floor", time: "1:00 PM – 3:00 PM", minTeam: 1, maxTeam: 1 },
  { id: "link-logic", name: "LINK LOGIC", category: "TECHNICAL", day: 1, venue: "IoT Smart Classroom", time: "10:00 AM – 12:30 PM", minTeam: 1, maxTeam: 1 },
  { id: "e-sports", name: "E-SPORTS (FREE FIRE)", category: "NON-TECHNICAL", day: 1, venue: "Embedded Lab, 2nd Floor", time: "9:30 AM – 3:00 PM", minTeam: 1, maxTeam: 3 },
  { id: "juice-matching", name: "JUICE MATCHING CHALLENGE", category: "NON-TECHNICAL", day: 1, venue: "Class Room 215", time: "9:30 AM – 3:00 PM", minTeam: 1, maxTeam: 1 },
  { id: "wrong-answers-only", name: "WRONG ANSWERS ONLY", category: "NON-TECHNICAL", day: 1, venue: "Class Room 216", time: "9:30 AM – 3:00 PM", minTeam: 1, maxTeam: 1 },
  { id: "workshop", name: "WORKSHOP", category: "TECHNICAL", day: 2, venue: "Edison Hall", time: "9:30 AM – 12:30 PM", minTeam: 1, maxTeam: 1 },
  { id: "reverse-coding", name: "REVERSE CODING", category: "TECHNICAL", day: 2, venue: "IoT Lab, 1st Floor", time: "1:00 PM – 3:00 PM", minTeam: 1, maxTeam: 1 },
  { id: "cup-chaos", name: "CUP CHAOS", category: "NON-TECHNICAL", day: 2, venue: "Class Room 215", time: "9:30 AM – 3:00 PM", minTeam: 1, maxTeam: 1 },
  { id: "pass-it-twist-it", name: "PASS IT, TWIST IT", category: "NON-TECHNICAL", day: 2, venue: "Class Room 216", time: "9:30 AM – 3:00 PM", minTeam: 1, maxTeam: 1 },
  { id: "balloon-cup-rush", name: "BALLOON CUP RUSH", category: "NON-TECHNICAL", day: 2, venue: "Class Room 217", time: "9:30 AM – 3:00 PM", minTeam: 1, maxTeam: 1 },
];

export const eventsByDay = (day: EventDay) => catalogEvents.filter((e) => e.day === day);

export const findEvent = (id: string) => catalogEvents.find((e) => e.id === id);

/** Largest team size across the chosen events (1 when every pick is solo). */
export const maxTeamSizeFor = (ids: string[]) =>
  ids.reduce((max, id) => Math.max(max, findEvent(id)?.maxTeam ?? 1), 1);

/** Days involved in the chosen events, ascending. */
export const daysFor = (ids: string[]): EventDay[] => {
  const days = new Set<EventDay>();
  ids.forEach((id) => {
    const found = findEvent(id);
    if (found) days.add(found.day);
  });
  return [...days].sort((a, b) => a - b);
};
