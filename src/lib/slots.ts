export type Service = { id: string; name: string; duration: number; price: number; description: string };
export type Dentist = { id: string; name: string; title: string; bio: string; active: boolean };
export type DayHours = { closed: boolean; open: string; close: string };
export type BookingStatus = "confirmed" | "cancelled" | "completed";
export type Booking = {
  id: string;
  serviceId: string;
  dentistId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  status: BookingStatus;
  notes?: string;
};

export const toMin = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseIso = (s: string) => new Date(s + "T00:00:00");
export const addDays = (s: string, n: number) => {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return isoDate(d);
};

export function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export type Slot = { time: string; available: boolean; dentistId?: string | undefined };

/** Slots every 30 min within working hours. A slot is taken when every eligible dentist
 *  has an overlapping active booking or a mock "busy" block. Closed days return []. */
export function getSlots(opts: {
  date: string;
  dentistIds: string[];
  hours: DayHours[];
  bookings: Booking[];
  services: Service[];
  duration: number;
  ignoreBookingId?: string | undefined;
  mockBusy?: boolean | undefined;
}): Slot[] {
  const wh = opts.hours[parseIso(opts.date).getDay()];
  if (!wh || wh.closed || opts.dentistIds.length === 0) return [];
  const durOf = (id: string) => opts.services.find((s) => s.id === id)?.duration ?? 30;
  const slots: Slot[] = [];
  for (let t = toMin(wh.open); t + opts.duration <= toMin(wh.close); t += 30) {
    const time = fromMin(t);
    const free = opts.dentistIds.find((did) => {
      if (opts.mockBusy !== false && hash(opts.date + time + did) % 3 === 0) return false;
      return !opts.bookings.some((b) => {
        if (b.id === opts.ignoreBookingId || b.status === "cancelled") return false;
        if (b.dentistId !== did || b.date !== opts.date) return false;
        const bs = toMin(b.time);
        return t < bs + durOf(b.serviceId) && bs < t + opts.duration;
      });
    });
    slots.push({ time, available: !!free, dentistId: free });
  }
  return slots;
}
