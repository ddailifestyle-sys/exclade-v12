import dhayalanQr from "@/assets/upi-qr-dhayalan.jpg.asset.json";
import vinishkaQr from "@/assets/upi-qr-vinishka.jpg.asset.json";
import nandhiniQr from "@/assets/upi-qr-nandhini.jpg.asset.json";
import santhoshQr from "@/assets/upi-qr-santhosh.jpg.asset.json";
import type { EventDay } from "@/data/eventCatalog";

export type PaymentQr = {
  id: string;
  holder: string;
  upiId: string;
  url: string;
};

/** Rotation cadence: one channel serves 30 registrations, then the next takes over. */
export const CLICKS_PER_QR = 30;

/** Day 1 events collect through these channels, day 2 events through the other pair. */
export const qrsByDay: Record<EventDay, PaymentQr[]> = {
  1: [
    { id: "nandhini", holder: "Nandhini S", upiId: "9944981163@ptaxis", url: nandhiniQr.url },
    { id: "santhosh", holder: "Santhosh Gurunathan", upiId: "itsmesanthosh.guru-1@okaxis", url: santhoshQr.url },
  ],
  2: [
    { id: "dhayalan", holder: "Dhayalan B", upiId: "dhayalanb2@okhdfcbank", url: dhayalanQr.url },
    { id: "vinishka", holder: "Vinishka G", upiId: "vinika03042006@oksbi", url: vinishkaQr.url },
  ],
};

const storageKey = (day: EventDay) => `exclade:reg-clicks:day-${day}`;

export const readClicks = (day: EventDay): number => {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(storageKey(day));
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const recordClick = (day: EventDay): number => {
  const next = readClicks(day) + 1;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(day), String(next));
  }
  return next;
};

/** The channel currently on duty for a day: advances once every 30 registrations. */
export const qrForDay = (day: EventDay, clicks: number): PaymentQr => {
  const pool = qrsByDay[day];
  return pool[Math.floor(clicks / CLICKS_PER_QR) % pool.length]!;
};
