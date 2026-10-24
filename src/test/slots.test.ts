import { describe, expect, it } from "vitest";
import { getSlots, type Booking, type DayHours } from "@/lib/slots";

const hours: DayHours[] = Array.from({ length: 7 }, (_, i) => ({
  closed: i === 0,
  open: "09:00",
  close: "11:00",
}));
const services = [{ id: "s", name: "Clean", duration: 60, price: 1, description: "" }];
const base = { hours, services, duration: 30, mockBusy: false };

describe("slots", () => {
  it("returns no slots on a closed day (Sunday)", () => {
    expect(getSlots({ ...base, date: "2026-10-25", dentistIds: ["d"], bookings: [] })).toEqual([]);
  });
  it("marks a slot taken when the dentist has an overlapping booking", () => {
    const b: Booking = { id: "b", serviceId: "s", dentistId: "d", date: "2026-10-26", time: "09:00", name: "", phone: "", email: "", status: "confirmed" };
    const slots = getSlots({ ...base, date: "2026-10-26", dentistIds: ["d"], bookings: [b] });
    expect(slots.map((s) => s.available)).toEqual([false, false, true, true]);
  });
  it("cancelled bookings free the slot", () => {
    const b: Booking = { id: "b", serviceId: "s", dentistId: "d", date: "2026-10-26", time: "09:00", name: "", phone: "", email: "", status: "cancelled" };
    const slots = getSlots({ ...base, date: "2026-10-26", dentistIds: ["d"], bookings: [b] });
    expect(slots[0]?.available).toBe(true);
  });
});
