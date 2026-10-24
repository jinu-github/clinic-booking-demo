import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { addDays, hash, isoDate, type Booking, type DayHours, type Dentist, type Service } from "./slots";

export type State = {
  services: Service[];
  dentists: Dentist[];
  hours: DayHours[];
  bookings: Booking[];
  admin: boolean;
};

const KEY = "seabright-demo-v1";

const services: Service[] = [
  { id: "checkup", name: "Check-up & Clean", duration: 45, price: 95, description: "Exam, scale and polish, plus a gentle chat about your smile." },
  { id: "whitening", name: "Teeth Whitening", duration: 60, price: 280, description: "In-chair whitening for a brighter, even shade." },
  { id: "filling", name: "Fillings", duration: 30, price: 140, description: "Tooth-coloured fillings that blend in naturally." },
  { id: "kids", name: "Children's Visit", duration: 30, price: 60, description: "A relaxed, playful first visit for little ones." },
  { id: "emergency", name: "Emergency Care", duration: 30, price: 120, description: "Same-day help for pain, chips or swelling." },
  { id: "invisalign", name: "Aligner Consult", duration: 45, price: 0, description: "Free consultation for clear aligners." },
];

const dentists: Dentist[] = [
  { id: "maya", name: "Dr. Maya Okafor", title: "General & Family Dentist", bio: "Known for her calm chairside manner and love of nervous patients.", active: true },
  { id: "liam", name: "Dr. Liam Chen", title: "Cosmetic Dentist", bio: "Whitening and aligner specialist with an eye for natural results.", active: true },
  { id: "sofia", name: "Dr. Sofia Marín", title: "Paediatric Dentist", bio: "Makes first visits fun, with a sticker drawer to prove it.", active: true },
];

const hours: DayHours[] = [
  { closed: true, open: "09:00", close: "13:00" },
  { closed: false, open: "08:30", close: "17:30" },
  { closed: false, open: "08:30", close: "17:30" },
  { closed: false, open: "08:30", close: "19:00" },
  { closed: false, open: "08:30", close: "17:30" },
  { closed: false, open: "08:30", close: "16:00" },
  { closed: false, open: "09:00", close: "13:00" },
];

const names = ["Ava Thompson", "Noah Patel", "Isla Brown", "Leo Martins", "Zara Ahmed", "Ethan Wright", "Mia Rossi", "Oscar Kim", "Ruby Nguyen", "Jack Wilson", "Chloe Diaz", "Henry Clarke"];
const times = ["09:00", "09:30", "10:30", "11:00", "13:00", "14:00", "15:30", "16:00"];

function seed(): State {
  const today = isoDate(new Date());
  const bookings: Booking[] = [];
  for (let d = -6; d <= 12; d++) {
    const date = addDays(today, d);
    if (hours[new Date(date + "T00:00").getDay()]!.closed) continue;
    const count = 2 + (hash(date) % 4);
    for (let i = 0; i < count; i++) {
      const h = hash(date + i);
      const name = names[h % names.length]!;
      bookings.push({
        id: `B${1000 + bookings.length}`,
        serviceId: services[(h >> 3) % services.length]!.id,
        dentistId: dentists[i % dentists.length]!.id,
        date,
        time: times[(h >> 5) % times.length]!,
        name,
        phone: `07${String(h).slice(0, 3).padEnd(3, "0")} ${String(h).slice(-6).padStart(6, "4")}`,
        email: name.toLowerCase().replace(" ", ".") + "@example.com",
        status: d < 0 ? (h % 7 === 0 ? "cancelled" : "completed") : h % 9 === 0 ? "cancelled" : "confirmed",
      });
    }
  }
  return { services, dentists, hours, bookings, admin: false };
}

type Ctx = {
  state: State | null;
  update: (fn: (s: State) => State) => void;
  addBooking: (b: Omit<Booking, "id" | "status">) => Booking;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    const t = setTimeout(() => setState(raw ? JSON.parse(raw) : seed()), 350);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const update = (fn: (s: State) => State) => setState((s) => (s ? fn(s) : s));
  const ctx: Ctx = {
    state,
    update,
    addBooking: (b) => {
      const booking: Booking = { ...b, id: `B${Math.floor(2000 + Math.random() * 7000)}`, status: "confirmed" };
      update((s) => ({ ...s, bookings: [...s.bookings, booking] }));
      return booking;
    },
    updateBooking: (id, patch) =>
      update((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
    reset: () => setState({ ...seed(), admin: state?.admin ?? false }),
  };
  return <StoreCtx.Provider value={ctx}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

export const fmtPrice = (p: number) => (p === 0 ? "Free" : `$${p}`);
export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", opts);
export const fmtTime = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
};
