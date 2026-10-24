import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/site";
import { addDays, isoDate, parseIso, type Booking } from "@/lib/slots";
import { fmtDate, fmtTime, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Seabright Dental staff" }, { name: "description", content: "Day and week view of bookings." }] }),
  component: CalendarPage,
});

const statusBar = { confirmed: "border-l-primary", cancelled: "border-l-destructive opacity-60", completed: "border-l-success" };

function BookingChip({ b, compact }: { b: Booking; compact?: boolean }) {
  const { state } = useStore();
  const s = state?.services.find((x) => x.id === b.serviceId);
  const d = state?.dentists.find((x) => x.id === b.dentistId);
  return (
    <Link to="/admin/bookings/$id" params={{ id: b.id }} className={cn("block rounded-2xl border border-l-4 bg-card p-3 shadow-soft transition hover:border-primary", statusBar[b.status])}>
      <p className="text-xs font-semibold text-primary">{fmtTime(b.time)}</p>
      <p className={cn("truncate font-medium", compact ? "text-xs" : "text-sm")}>{b.name}</p>
      <p className="truncate text-xs text-muted-foreground">{s?.name}{!compact && ` · ${d?.name}`}</p>
    </Link>
  );
}

function CalendarPage() {
  const { state } = useStore();
  const [view, setView] = useState<"day" | "week">("day");
  const [date, setDate] = useState(() => isoDate(new Date()));
  if (!state) return null;
  const ws = addDays(date, -((parseIso(date).getDay() + 6) % 7));
  const days = view === "day" ? [date] : Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const forDay = (d: string) => state.bookings.filter((b) => b.date === d).sort((a, b) => a.time.localeCompare(b.time));
  const step = view === "day" ? 1 : 7;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Calendar</h1>
        <div className="flex rounded-full border bg-card p-1">
          {(["day", "week"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium capitalize", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{v}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setDate(addDays(date, -step))} className="grid size-10 place-items-center rounded-full border bg-card"><ChevronLeft className="size-4" /></button>
        <p className="flex-1 text-center font-semibold">
          {view === "day" ? fmtDate(date, { weekday: "long", day: "numeric", month: "long" }) : `${fmtDate(ws, { day: "numeric", month: "short" })} – ${fmtDate(addDays(ws, 6), { day: "numeric", month: "short" })}`}
        </p>
        <button onClick={() => setDate(addDays(date, step))} className="grid size-10 place-items-center rounded-full border bg-card"><ChevronRight className="size-4" /></button>
        <button onClick={() => setDate(isoDate(new Date()))} className="rounded-full border bg-card px-4 py-2 text-sm">Today</button>
      </div>

      {view === "day" ? (
        forDay(date).length === 0 ? (
          <EmptyState icon={<Inbox className="size-5" />} title="No bookings" text={state.hours[parseIso(date).getDay()]!.closed ? "The clinic is closed this day." : "Nothing booked on this day yet."} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {state.dentists.map((d) => (
              <div key={d.id}>
                <p className="mb-2 text-sm font-semibold">{d.name}</p>
                <div className="space-y-2">
                  {forDay(date).filter((b) => b.dentistId === d.id).map((b) => <BookingChip key={b.id} b={b} />)}
                  {forDay(date).every((b) => b.dentistId !== d.id) && <p className="rounded-2xl border border-dashed p-3 text-xs text-muted-foreground">No appointments</p>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid gap-3 md:grid-cols-7">
          {days.map((d) => (
            <div key={d} className={cn("rounded-3xl bg-muted/60 p-2", d === isoDate(new Date()) && "ring-2 ring-primary/40")}>
              <button onClick={() => { setDate(d); setView("day"); }} className="mb-2 w-full px-1 text-left text-sm font-semibold">
                {fmtDate(d, { weekday: "short", day: "numeric" })} <span className="font-normal text-muted-foreground">· {forDay(d).length}</span>
              </button>
              <div className="space-y-2">
                {forDay(d).map((b) => <BookingChip key={b.id} b={b} compact />)}
                {forDay(d).length === 0 && <p className="px-1 pb-1 text-xs text-muted-foreground">—</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
